import { ASSET_SLOTS } from '../assets/slots';
import { readImageDimensions } from './imageDimensions';
import { nineSliceRenderWidths } from './SkinSurface';
import { parseSkinTokens } from './parseSkinTokens';
import { resolveInheritanceChain } from './resolveSkin';
import { parseSkinRegistry } from './skinRegistry';
import {
  SKIN_CONTRACT_VERSION,
  SKIN_LIMITS,
  type SkinAssetDefinition,
  type SkinManifest,
} from './skinTypes';
import { validateSkinManifest } from './validateSkinManifest';

// skin:validate本体(P0-2)。実ファイルのbyte数・実寸・幾何まで検証する。
// IOは注入式なので、node(vitest/CLI)でもfake IOのユニットテストでも動く。

export type SkinPackageFs = {
  readJson(relativePath: string): unknown | null;
  readText(relativePath: string): string | null;
  fileExists(relativePath: string): boolean;
  fileSize(relativePath: string): number | null;
  /** ディレクトリ直下のファイル名一覧(なければ空) */
  listFiles(relativeDir: string): string[];
  readBytes(relativePath: string, maxBytes: number): Uint8Array | null;
};

export type SkinValidationReport = {
  ok: boolean;
  issues: string[];
  checkedSkins: string[];
};

const OFFICIAL_ALLOWED_EXTENSIONS = ['.png', '.webp', '.svg'];
const EXTERNAL_ALLOWED_EXTENSIONS = ['.png', '.webp'];

function extensionAllowed(file: string, origin: SkinManifest['origin']): boolean {
  const allowed =
    origin === 'official' ? OFFICIAL_ALLOWED_EXTENSIONS : EXTERNAL_ALLOWED_EXTENSIONS;
  return allowed.some((ext) => file.endsWith(ext));
}

function validateSlotGeometry(
  skinId: string,
  slotName: string,
  def: SkinAssetDefinition,
  width: number,
  height: number,
  issues: string[],
): void {
  if (def.intrinsicSize) {
    if (def.intrinsicSize.width !== width || def.intrinsicSize.height !== height) {
      issues.push(
        `${skinId}/${slotName}: intrinsicSize(${def.intrinsicSize.width}x${def.intrinsicSize.height})と実画像(${width}x${height})が一致しません`,
      );
    }
  }
  if (width > SKIN_LIMITS.maxIntrinsicSizePx || height > SKIN_LIMITS.maxIntrinsicSizePx) {
    issues.push(
      `${skinId}/${slotName}: 画像が大きすぎます(${width}x${height} > ${SKIN_LIMITS.maxIntrinsicSizePx})`,
    );
  }
  if (def.nineSlice) {
    const { top, right, bottom, left } = def.nineSlice;
    if (top + bottom >= height || left + right >= width) {
      issues.push(
        `${skinId}/${slotName}: nine-sliceが画像境界を超えています(${width}x${height}, slice ${top}/${right}/${bottom}/${left})`,
      );
    }
  }
  if (def.contentSafeArea) {
    const { top, right, bottom, left } = def.contentSafeArea;
    if (top + bottom >= height || left + right >= width) {
      issues.push(`${skinId}/${slotName}: contentSafeAreaが画像境界を超えています`);
    }
  }
}

// 画像の有無に関わらないslot定義自体の契約検証(P0-5)
function validateSlotDefinition(
  skinId: string,
  slotName: string,
  def: SkinAssetDefinition,
  issues: string[],
): void {
  if (def.renderMode !== 'nine-slice') {
    return;
  }
  if (!def.minRenderSize) {
    issues.push(
      `${skinId}/${slotName}: nine-slice slotはminRenderSize(枠潰れ防止の最小描画サイズ)が必要です`,
    );
    return;
  }
  // 描画borderWidth(CSS px)が最小描画サイズ内に収まること
  const render = nineSliceRenderWidths(def);
  if (
    render.left + render.right >= def.minRenderSize.width ||
    render.top + render.bottom >= def.minRenderSize.height
  ) {
    issues.push(
      `${skinId}/${slotName}: nine-sliceの描画幅(${render.top}/${render.right}/${render.bottom}/${render.left})がminRenderSize(${def.minRenderSize.width}x${def.minRenderSize.height})に収まりません`,
    );
  }
}

// 1スキンのslot定義とパッケージ実体を検証する
function validateSkinAssets(
  io: SkinPackageFs,
  manifest: SkinManifest,
  issues: string[],
): void {
  const skinId = manifest.id;
  const finalDir = `skins/${skinId}/generated/final`;
  const referencedFiles = new Set<string>();
  let totalBytes = 0;

  for (const [slotName, def] of Object.entries(manifest.slots)) {
    if (!def) {
      continue;
    }
    validateSlotDefinition(skinId, slotName, def, issues);
    // status/file整合(P0-2: finalでfile:nullは不正)
    if (def.status === 'final' && def.file === null) {
      issues.push(`${skinId}/${slotName}: status finalなのにfileがありません`);
      continue;
    }
    if (def.status === 'placeholder' && def.file !== null) {
      issues.push(
        `${skinId}/${slotName}: placeholderはfileを持てません(候補はcandidates/で確認しfinal昇格時にstatusを更新)`,
      );
      continue;
    }
    if (def.file === null) {
      continue;
    }

    referencedFiles.add(def.file);

    if (!extensionAllowed(def.file, manifest.origin)) {
      issues.push(
        `${skinId}/${slotName}: trust level(${manifest.origin})で許可されないファイル形式です: ${def.file}`,
      );
      continue;
    }

    const filePath = `${finalDir}/${def.file}`;
    if (!io.fileExists(filePath)) {
      issues.push(`${skinId}/${slotName}: ファイルが存在しません: ${filePath}`);
      continue;
    }
    const size = io.fileSize(filePath);
    if (size === null) {
      issues.push(`${skinId}/${slotName}: ファイルサイズを取得できません: ${filePath}`);
      continue;
    }
    totalBytes += size;
    if (size > SKIN_LIMITS.maxAssetFileBytes) {
      issues.push(
        `${skinId}/${slotName}: ファイルが大きすぎます(${size} > ${SKIN_LIMITS.maxAssetFileBytes})`,
      );
    }

    // 実画像の寸法検証(PNG/WebPのみ。SVGは公式レビュー対象)
    const bytes = io.readBytes(filePath, 64);
    if (bytes) {
      const dimensions = readImageDimensions(def.file, bytes);
      if (dimensions) {
        validateSlotGeometry(skinId, slotName, def, dimensions.width, dimensions.height, issues);
      } else if (def.file.endsWith('.png') || def.file.endsWith('.webp')) {
        issues.push(`${skinId}/${slotName}: 画像ヘッダを読めません: ${def.file}`);
      }
    }
  }

  if (totalBytes > SKIN_LIMITS.maxSkinTotalBytes) {
    issues.push(
      `${skinId}: スキン合計サイズが大きすぎます(${totalBytes} > ${SKIN_LIMITS.maxSkinTotalBytes})`,
    );
  }

  // final/内の孤児ファイル(manifest未参照)は昇格手順違反として警告する
  for (const file of io.listFiles(finalDir)) {
    if (file === '.gitkeep') {
      continue;
    }
    if (!referencedFiles.has(file)) {
      issues.push(`${skinId}: final/にmanifest未参照のファイルがあります: ${file}`);
    }
  }
}

export function validateSkinPackages(io: SkinPackageFs): SkinValidationReport {
  const issues: string[] = [];
  const checkedSkins: string[] = [];

  // 1. レジストリ
  const registryRaw = io.readJson('SKIN-MANIFEST.json');
  const registryFull = registryRaw as { skinContractVersion?: number } | null;
  const registry = parseSkinRegistry(registryRaw);
  if (!registry) {
    return { ok: false, issues: ['SKIN-MANIFEST.jsonが不正です'], checkedSkins };
  }
  if (
    typeof registryFull?.skinContractVersion === 'number' &&
    registryFull.skinContractVersion > SKIN_CONTRACT_VERSION
  ) {
    issues.push('SKIN-MANIFEST.jsonのskinContractVersionがアプリより新しいです');
  }

  // 2. 契約: SKIN-CONTRACT.jsonのslot幾何がbase manifestと完全一致すること
  const contract = io.readJson('SKIN-CONTRACT.json') as {
    skinContractVersion?: number;
    slots?: Record<string, unknown>;
  } | null;
  if (!contract || typeof contract.slots !== 'object' || contract.slots === null) {
    issues.push('SKIN-CONTRACT.jsonが不正です');
  }

  // 3. 各スキンパッケージ
  const manifests = new Map<string, SkinManifest>();
  for (const entry of registry.skins) {
    checkedSkins.push(entry.id);
    const raw = io.readJson(`skins/${entry.id}/skin.json`);
    if (raw === null) {
      issues.push(`スキン ${entry.id}: skin.jsonを読み込めません`);
      continue;
    }
    const validated = validateSkinManifest(raw);
    if (!validated.ok) {
      issues.push(...validated.issues.map((i) => `スキン ${entry.id}: ${i}`));
      continue;
    }
    if (validated.manifest.id !== entry.id) {
      issues.push(`スキン ${entry.id}: manifest idが一致しません(${validated.manifest.id})`);
      continue;
    }
    manifests.set(entry.id, validated.manifest);

    // tokens: 存在 + 公式基準で警告ゼロ
    const tokensPath = `skins/${entry.id}/${validated.manifest.tokensFile}`;
    const tokensText = io.readText(tokensPath);
    if (tokensText === null) {
      issues.push(`スキン ${entry.id}: tokensファイルがありません: ${tokensPath}`);
    } else {
      const trust = validated.manifest.origin === 'external' ? 'external' : 'official';
      const parsed = parseSkinTokens(tokensText, trust);
      issues.push(...parsed.issues.map((i) => `スキン ${entry.id}: ${i}`));
    }

    // assets: 実ファイル検証
    validateSkinAssets(io, validated.manifest, issues);
  }

  // 4. contractとbase manifestの幾何完全一致
  const base = manifests.get('base');
  if (base && contract?.slots) {
    const contractSlots = JSON.stringify(sortKeysDeep(contract.slots));
    const baseSlots = JSON.stringify(sortKeysDeep(base.slots as Record<string, unknown>));
    if (contractSlots !== baseSlots) {
      issues.push('SKIN-CONTRACT.jsonのslot幾何がbase skin.jsonと一致しません');
    }
    const contractKeys = Object.keys(contract.slots).sort();
    if (contractKeys.join(',') !== [...ASSET_SLOTS].sort().join(',')) {
      issues.push('SKIN-CONTRACT.jsonのslot一覧がASSET_SLOTSと一致しません');
    }
  }

  // 5. 継承検証(循環・欠落親)
  for (const skinId of manifests.keys()) {
    const { issues: chainIssues } = resolveInheritanceChain(skinId, manifests);
    issues.push(...chainIssues.map((i) => `スキン ${skinId}: ${i}`));
  }

  return { ok: issues.length === 0, issues, checkedSkins };
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortKeysDeep(v)]),
    );
  }
  return value;
}
