import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { applyDocumentSkin } from './skinDom';
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

export type SkinContextValue = {
  activeSkinId: string;
  availableSkins: SkinRegistryEntry[];
  /** nullの間はbundled tokens.css(=base相当)のfallbackで表示される */
  resolvedSkin: ResolvedSkin | null;
  skinIssues: string[];
  setActiveSkin: (skinId: string) => void;
};

export const SkinContext = createContext<SkinContextValue>({
  activeSkinId: BUILTIN_SKIN_REGISTRY.defaultSkinId,
  availableSkins: BUILTIN_SKIN_REGISTRY.skins,
  resolvedSkin: null,
  skinIssues: [],
  setActiveSkin: () => {},
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
  const loaderRef = useRef(createSkinLoader(createFetchSkinIo()));
  const requestSeqRef = useRef(0);

  const applySkin = useCallback(
    async (skinId: string, currentRegistry: SkinRegistry) => {
      const seq = ++requestSeqRef.current;
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
      setActiveSkinId(finalId);
      setResolvedSkin(finalResolved);
      setSkinIssues(finalIssues);
      applyDocumentSkin(finalId, finalResolved.tokens);
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

  const value = useMemo<SkinContextValue>(
    () => ({
      activeSkinId,
      availableSkins: registry.skins,
      resolvedSkin,
      skinIssues,
      setActiveSkin,
    }),
    [activeSkinId, registry.skins, resolvedSkin, skinIssues, setActiveSkin],
  );

  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}
