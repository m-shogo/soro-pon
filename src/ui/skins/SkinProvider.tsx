import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { applyDocumentSkin } from './skinDom';
import { collectSkinAssetUrls, preloadImages } from './skinPreload';
import {
  BUILTIN_SKIN_REGISTRY,
  createFetchSkinIo,
  createSkinLoader,
  fetchSkinRegistry,
  sanitizeSkinId,
  SKIN_STORAGE_KEY,
  type SkinRegistry,
  type SkinRegistryEntry,
} from './skinRegistry';
import type { ResolvedSkin } from './skinTypes';

export type SkinStatus = 'loading' | 'ready';

export type SkinContextValue = {
  activeSkinId: string;
  availableSkins: SkinRegistryEntry[];
  /** nullの間はbundled tokens.css(=base相当)のfallbackで表示される */
  resolvedSkin: ResolvedSkin | null;
  skinIssues: string[];
  /** 切り替え/初期読み込み中はloading(表示はfallbackのまま操作可能) */
  skinStatus: SkinStatus;
  setActiveSkin: (skinId: string) => void;
  /** 読み込み失敗時などにdefaultスキンへ戻す */
  resetToDefaultSkin: () => void;
};

export const SkinContext = createContext<SkinContextValue>({
  activeSkinId: BUILTIN_SKIN_REGISTRY.defaultSkinId,
  availableSkins: BUILTIN_SKIN_REGISTRY.skins,
  resolvedSkin: null,
  skinIssues: [],
  skinStatus: 'loading',
  setActiveSkin: () => {},
  resetToDefaultSkin: () => {},
});

// アプリ全体のスキン状態。
// - 起動時: registry取得 -> localStorageのskinIdを検証 -> スキン読み込み -> 適用
// - 失敗時: default -> base -> bundled tokensの順で必ず操作可能な状態に落とす
// - 切り替え: reloadせずtokens<style>とdata-skinを差し替えるだけ
export function SkinProvider({ children }: { children: ReactNode }) {
  const [registry, setRegistry] = useState<SkinRegistry>(BUILTIN_SKIN_REGISTRY);
  const [activeSkinId, setActiveSkinId] = useState<string>(
    BUILTIN_SKIN_REGISTRY.defaultSkinId,
  );
  const [resolvedSkin, setResolvedSkin] = useState<ResolvedSkin | null>(null);
  const [skinIssues, setSkinIssues] = useState<string[]>([]);
  const [skinStatus, setSkinStatus] = useState<SkinStatus>('loading');
  const loaderRef = useRef(createSkinLoader(createFetchSkinIo()));
  const requestSeqRef = useRef(0);
  // 実際にdocumentへ適用済みのskinId(preload失敗時に「前のスキンを維持」する判定用)
  const appliedSkinIdRef = useRef<string | null>(null);

  const applySkin = useCallback(
    async (skinId: string, currentRegistry: SkinRegistry) => {
      const seq = ++requestSeqRef.current;
      setSkinStatus('loading');
      const targetId = sanitizeSkinId(skinId, currentRegistry);
      const { resolved, issues } = await loaderRef.current.loadResolvedSkin(targetId);
      if (seq !== requestSeqRef.current) {
        return; // 後発の切り替えが優先
      }
      // 対象が読めなかった場合はdefault、それも失敗ならbaseへ
      let finalResolved = resolved;
      let finalId = targetId;
      const finalIssues = [...issues];
      if (resolved.chain.length === 0 && targetId !== currentRegistry.defaultSkinId) {
        const fallback = await loaderRef.current.loadResolvedSkin(
          currentRegistry.defaultSkinId,
        );
        finalResolved = fallback.resolved;
        finalId = currentRegistry.defaultSkinId;
        finalIssues.push(...fallback.issues, `defaultスキンへ復旧しました: ${finalId}`);
      }
      // P2-2: 可視アセットを先に読み込み、tokensとassetsを一括で適用する。
      // 途中失敗で新旧スキンが混ざって表示されるのを防ぐ。
      const assetUrls = collectSkinAssetUrls(finalResolved);
      const preloaded = await preloadImages(assetUrls);
      if (seq !== requestSeqRef.current) {
        return;
      }
      if (!preloaded && appliedSkinIdRef.current !== null) {
        // 前のスキンを維持し、状態だけ知らせる(初回起動時はfallbackで続行)
        setSkinIssues([
          ...finalIssues,
          `スキン ${finalId} の画像を読み込めなかったため切り替えを中止しました`,
        ]);
        setSkinStatus('ready');
        return;
      }
      setActiveSkinId(finalId);
      setResolvedSkin(finalResolved);
      setSkinIssues(finalIssues);
      setSkinStatus('ready');
      appliedSkinIdRef.current = finalId;
      applyDocumentSkin(finalId, finalResolved.tokens, {
        colorScheme: finalResolved.colorScheme,
        ...(finalResolved.themeColor !== undefined
          ? { themeColor: finalResolved.themeColor }
          : {}),
      });
      try {
        window.localStorage.setItem(SKIN_STORAGE_KEY, finalId);
      } catch {
        // 保存できなくても動作は継続
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loadedRegistry = await fetchSkinRegistry();
      if (cancelled) {
        return;
      }
      setRegistry(loadedRegistry);
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(SKIN_STORAGE_KEY);
      } catch {
        stored = null;
      }
      await applySkin(sanitizeSkinId(stored, loadedRegistry), loadedRegistry);
    })().catch(() => {
      // 起動を止めない。bundled tokensのままで動く
    });
    return () => {
      cancelled = true;
    };
  }, [applySkin]);

  const setActiveSkin = useCallback(
    (skinId: string) => {
      void applySkin(skinId, registry);
    },
    [applySkin, registry],
  );

  const resetToDefaultSkin = useCallback(() => {
    void applySkin(registry.defaultSkinId, registry);
  }, [applySkin, registry]);

  const value = useMemo<SkinContextValue>(
    () => ({
      activeSkinId,
      availableSkins: registry.skins,
      resolvedSkin,
      skinIssues,
      skinStatus,
      setActiveSkin,
      resetToDefaultSkin,
    }),
    [
      activeSkinId,
      registry.skins,
      resolvedSkin,
      skinIssues,
      skinStatus,
      setActiveSkin,
      resetToDefaultSkin,
    ],
  );

  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}
