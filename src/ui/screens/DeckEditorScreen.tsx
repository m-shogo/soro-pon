import { useMemo, useState } from 'react';
import type { DeckProject } from '../../domain/deck';
import { validateDeckProject } from '../../engine/validation/validateDeckProject';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { PaperPanel } from '../components/PaperPanel';

// 最小エディタ: 名前/説明/役の点数のみ編集できる。
// 構造編集(牌/カテゴリ/役の追加)は今後の安全テンプレートエディタで対応する。
export function DeckEditorScreen({
  deck,
  onSave,
  onBack,
}: {
  deck: DeckProject;
  onSave: (updated: DeckProject) => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState<DeckProject>(() => structuredClone(deck));
  const validation = useMemo(() => validateDeckProject({ deck: draft }), [draft]);
  const activeVariant = draft.variants.find((v) => v.id === draft.activeVariantId);

  const updateRolePoints = (roleId: string, basePoints: number) => {
    setDraft((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.id !== current.activeVariantId
          ? variant
          : {
              ...variant,
              winRoles: variant.winRoles.map((role) =>
                role.id === roleId ? { ...role, basePoints } : role,
              ),
            },
      ),
    }));
  };

  return (
    <div className="sp-screen">
      <div className="sp-screen__header">
        <h1 className="sp-screen__title">デッキ編集</h1>
        <Badge variant={validation.status === 'playable' ? 'info' : 'warning'}>
          {validation.status}
        </Badge>
        <div className="sp-screen__spacer" />
        <Button variant="primary" onClick={() => onSave(draft)}>
          保存する
        </Button>
        <Button variant="ghost" onClick={onBack}>
          保存せずもどる
        </Button>
      </div>
      <div className="sp-screen__body">
        <div className="sp-screen__col sp-screen__col--main sp-screen__col--scroll">
          <PaperPanel title="基本情報">
            <label className="sp-field">
              デッキ名
              <input
                type="text"
                value={draft.name}
                maxLength={80}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label className="sp-field" style={{ marginTop: 'var(--sp-space-8)' }}>
              説明
              <textarea
                rows={2}
                maxLength={500}
                value={draft.description ?? ''}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </label>
          </PaperPanel>
          <PaperPanel variant="aged" title="役の点数">
            <div className="sp-screen__col" style={{ gap: 'var(--sp-space-6)' }}>
              {activeVariant?.winRoles.map((role) => (
                <label key={role.id} className="sp-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--sp-space-12)' }}>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={role.basePoints}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value, 10);
                      if (Number.isInteger(value) && value >= 1 && value <= 999) {
                        updateRolePoints(role.id, value);
                      }
                    }}
                  />
                  <span>
                    {role.name}
                    <span style={{ color: 'var(--sp-color-ink-soft)', fontSize: 'var(--sp-font-xs)' }}>
                      {' '}
                      — {role.explanation}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </PaperPanel>
        </div>
        <div className="sp-screen__col sp-screen__col--side sp-screen__col--scroll">
          <PaperPanel variant="ink" title="検証">
            {validation.issues.length === 0 ? (
              <span style={{ fontSize: 'var(--sp-font-xs)' }}>問題なし。</span>
            ) : (
              <ul className="sp-issue-list">
                {validation.issues.map((issue, i) => (
                  <li key={`${issue.code}-${i}`}>
                    <Badge variant={issue.severity === 'info' ? 'info' : 'warning'}>
                      {issue.code}
                    </Badge>{' '}
                    {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </PaperPanel>
        </div>
      </div>
    </div>
  );
}
