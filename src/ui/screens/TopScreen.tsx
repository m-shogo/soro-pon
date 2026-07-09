import { Button } from '../components/Button';
import { InkDivider } from '../primitives/InkDivider';

export function TopScreen({
  onPlayNow,
  onDeckList,
  onImport,
  hasPlayableDeck,
}: {
  onPlayNow: () => void;
  onDeckList: () => void;
  onImport: () => void;
  hasPlayableDeck: boolean;
}) {
  return (
    <div className="sp-screen">
      <div className="sp-screen__header">
        <h1 className="sp-screen__title">soro-pon</h1>
        <span className="sp-screen__subtitle">Vamp Pon 世界の中で流行っている記憶札遊び</span>
      </div>
      <div className="sp-screen__body" style={{ alignItems: 'center' }}>
        <div className="sp-top-menu">
          <Button
            variant="paper"
            subLabel="すぐに対戦をはじめます"
            onClick={onPlayNow}
            disabled={!hasPlayableDeck}
          >
            まず遊ぶ
          </Button>
          <Button variant="paper" subLabel="保存したデッキを確認・編集します" onClick={onDeckList}>
            デッキ一覧
          </Button>
          <Button variant="paper" subLabel="デッキデータ(JSON)を読み込みます" onClick={onImport}>
            JSONを読み込む
          </Button>
          <InkDivider />
          <p className="sp-top-tagline">
            記憶の札を集め、役を作って競う遊びです。
            <br />
            夜の帳が下りた、記憶の欠片を集める頃。
          </p>
        </div>
        <div className="sp-screen__spacer" />
      </div>
    </div>
  );
}
