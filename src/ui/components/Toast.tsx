import './components.css';

// 一時通知の帯。保存エラー・起動時の回復通知などに使う。
// 色だけに依存せず文言で伝える(warning系はプレフィックスを付ける)。
export function Toast({
  messages,
  tone = 'info',
}: {
  messages: string[];
  tone?: 'info' | 'warning';
}) {
  if (messages.length === 0) {
    return null;
  }
  return (
    <div className={`sp-toast sp-toast--${tone}`} role="status">
      {messages.map((message, i) => (
        <span key={i} className="sp-toast__item">
          {tone === 'warning' ? '⚠ ' : ''}
          {message}
        </span>
      ))}
    </div>
  );
}
