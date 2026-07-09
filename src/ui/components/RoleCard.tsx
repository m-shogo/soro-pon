import './components.css';

export type RoleCardState = 'completed' | 'tenpai' | 'near' | 'none';

const STATE_LABEL: Record<Exclude<RoleCardState, 'none'>, string> = {
  completed: 'そろった',
  tenpai: 'あと1枚',
  near: 'とちゅう',
};

export function RoleCard({
  name,
  basePoints,
  explanation,
  state = 'none',
}: {
  name: string;
  basePoints: number;
  explanation: string;
  state?: RoleCardState;
}) {
  return (
    <div className={`sp-role-card${state === 'completed' ? ' sp-role-card--completed' : ''}`}>
      <div className="sp-role-card__head">
        <span className="sp-role-card__name">{name}</span>
        <span className="sp-role-card__points">{basePoints}点</span>
      </div>
      {state !== 'none' && (
        <span className={`sp-role-card__state sp-role-card__state--${state}`}>
          {STATE_LABEL[state]}
        </span>
      )}
      <span className="sp-role-card__explanation">{explanation}</span>
    </div>
  );
}
