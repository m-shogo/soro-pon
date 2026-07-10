import { useEffect, useState } from 'react';
import { createFetchSkinIo, createSkinLoader } from '../skins/skinRegistry';
import {
  DEFAULT_PREVIEW_SWATCHES,
  extractSkinPreviewSwatches,
  type SkinPreviewSwatches,
} from '../skins/skinPreview';
import { useSkin } from '../skins/useSkin';
import { Button } from './Button';
import { SkinPreviewCard } from './SkinPreviewCard';
import './components.css';

// スキン切替の共通UI(H4/P0-4)。GalleryとTOPの両方で同じものを使う。
// - reloadなしでsetActiveSkinを呼ぶだけ(画面/対局/編集状態は失われない)
// - 読み込み中はloading表示、失敗noticeとdefault復旧ボタンを持つ
export function SkinSelector() {
  const { activeSkinId, availableSkins, skinIssues, skinStatus, setActiveSkin, resetToDefaultSkin } =
    useSkin();
  const [previews, setPreviews] = useState<Record<string, SkinPreviewSwatches>>({});

  const selectable = availableSkins.filter((s) => s.selectable);

  // プレビュー用に各スキンの解決済みtokensを1回だけ読む(適用はしない)
  useEffect(() => {
    let cancelled = false;
    const loader = createSkinLoader(createFetchSkinIo());
    (async () => {
      const entries = await Promise.all(
        selectable.map(async (entry) => {
          try {
            const { resolved } = await loader.loadResolvedSkin(entry.id);
            return [entry.id, extractSkinPreviewSwatches(resolved.tokens)] as const;
          } catch {
            return [entry.id, DEFAULT_PREVIEW_SWATCHES] as const;
          }
        }),
      );
      if (!cancelled) {
        setPreviews(Object.fromEntries(entries));
      }
    })();
    return () => {
      cancelled = true;
    };
    // selectableは毎render新配列なのでid列で比較する
  }, [selectable.map((s) => s.id).join(',')]);

  const hasIssues = skinIssues.length > 0;

  return (
    <div className="sp-skin-selector">
      <div className="sp-skin-selector__list" role="group" aria-label="スキン選択">
        {selectable.map((entry) => (
          <SkinPreviewCard
            key={entry.id}
            label={entry.label}
            swatches={previews[entry.id] ?? DEFAULT_PREVIEW_SWATCHES}
            active={entry.id === activeSkinId}
            disabled={skinStatus === 'loading'}
            onSelect={() => setActiveSkin(entry.id)}
          />
        ))}
      </div>
      {skinStatus === 'loading' && (
        <p className="sp-skin-selector__notice" role="status">
          スキンを読み込んでいます…
        </p>
      )}
      {hasIssues && skinStatus === 'ready' && (
        <div className="sp-skin-selector__notice" role="alert">
          <p>スキンの読み込みで問題がありました。表示は安全な状態に戻しています。</p>
          <Button variant="ghost" onClick={resetToDefaultSkin}>
            はじめのスキンに戻す
          </Button>
        </div>
      )}
    </div>
  );
}
