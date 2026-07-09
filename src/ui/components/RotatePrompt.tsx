import './components.css';

// 縦画面時のフォールバック。soro-ponは横画面が正。
export function RotatePrompt() {
  return (
    <div className="sp-rotate-prompt">
      <span className="sp-rotate-prompt__icon" aria-hidden="true">
        ⟳
      </span>
      <p>
        soro-ponは横画面の遊びです。
        <br />
        端末を横に回してください。
      </p>
    </div>
  );
}
