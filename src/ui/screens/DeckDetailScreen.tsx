import type { DeckProject } from '../../domain/deck';
import type { DeckValidationResult } from '../../domain/validation';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CategoryChip } from '../components/CategoryChip';
import { PaperPanel } from '../components/PaperPanel';
import { RoleCard } from '../components/RoleCard';
import { SectionHeader } from '../components/SectionHeader';
import { ValidationIssueList } from '../components/ValidationIssueList';
import { TileCard } from '../components/TileCard';

export function DeckDetailScreen({
  deck,
  validation,
  onBack,
  onStartSetup,
  onEdit,
  onExport,
  onDelete,
}: {
  deck: DeckProject;
  validation: DeckValidationResult;
  onBack: () => void;
  onStartSetup: () => void;
  onEdit: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const normalVariant = deck.variants.find((v) => v.id === deck.activeVariantId);
  const canPlay = validation.status === 'playable' || validation.status === 'playableWithWarnings';
  const categoryById = new Map(deck.categories.map((c) => [c.id, c]));

  return (
    <div className="sp-screen">
      <SectionHeader
        title={deck.name}
        badges={
          <Badge variant={canPlay ? 'info' : 'warning'}>
            {canPlay ? '対局できます' : '対局できません(要修正)'}
          </Badge>
        }
        actions={
          <>
            <Button variant="primary" onClick={onStartSetup} disabled={!canPlay}>
              対局へ
            </Button>
            <Button variant="ink" onClick={onEdit}>
              編集
            </Button>
            <Button variant="ink" onClick={onExport}>
              エクスポート
            </Button>
            <Button variant="ghost" onClick={onDelete}>
              削除
            </Button>
            <Button variant="ghost" onClick={onBack}>
              もどる
            </Button>
          </>
        }
      />
      <div className="sp-screen__body">
        <div className="sp-screen__col sp-screen__col--main sp-screen__col--scroll">
          <PaperPanel variant="aged" title="デッキ情報">
            <p style={{ margin: 0, fontSize: 'var(--sp-font-sm)' }}>{deck.description ?? ''}</p>
            <div className="sp-deck-card__meta">
              {deck.categories.map((category) => (
                <CategoryChip
                  key={category.id}
                  name={category.name}
                  color={category.color}
                  {...(category.icon !== undefined ? { icon: category.icon } : {})}
                />
              ))}
            </div>
          </PaperPanel>
          <PaperPanel title={`役 (${normalVariant?.winRoles.length ?? 0})`}>
            <div className="sp-screen__col" style={{ gap: 'var(--sp-space-6)' }}>
              {normalVariant?.winRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  name={role.name}
                  basePoints={role.basePoints}
                  explanation={role.explanation}
                />
              ))}
            </div>
          </PaperPanel>
          <PaperPanel variant="aged" title={`牌 (${deck.tiles.length}種)`}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                ['--tile-w' as string]: '44px',
                ['--tile-h' as string]: '58px',
              }}
            >
              {deck.tiles.map((tile) => {
                const category = categoryById.get(tile.primaryCategoryId);
                return (
                  <TileCard
                    key={tile.id}
                    name={tile.name}
                    {...(tile.emoji !== undefined ? { emoji: tile.emoji } : {})}
                    fallbackLabel={tile.fallbackLabel}
                    {...(category ? { categoryColor: category.color, categoryName: category.name } : {})}
                    showName={false}
                    disabled
                  />
                );
              })}
            </div>
          </PaperPanel>
        </div>
        <div className="sp-screen__col sp-screen__col--side sp-screen__col--scroll">
          <PaperPanel variant="ink" title="検証結果">
            <ValidationIssueList issues={validation.issues} />
          </PaperPanel>
        </div>
      </div>
    </div>
  );
}
