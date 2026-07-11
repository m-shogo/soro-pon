import { Component, type ReactNode } from 'react';
import { resetAllLocalData } from '../../storage/resetLocalData';
import { Button } from './Button';
import { ErrorState } from './EmptyState';
import './components.css';

type Props = { children: ReactNode };
type State = { error: Error | null; confirmReset: boolean };

// アプリ全体のエラー境界(P1-4)。描画中の例外で白画面にせず、
// 再読み込みとローカルデータ初期化の復旧経路を必ず見せる。
export class AppErrorBoundary extends Component<Props, State> {
  override state: State = { error: null, confirmReset: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  override render() {
    if (this.state.error === null) {
      return this.props.children;
    }
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--sp-space-12)',
          padding: 'var(--sp-space-24)',
        }}
      >
        <ErrorState
          message="問題が起きたため画面を表示できませんでした。"
          detail={this.state.error.message}
        />
        <div style={{ display: 'flex', gap: 'var(--sp-space-8)', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => window.location.reload()}>
            再読み込みする
          </Button>
          {!this.state.confirmReset ? (
            <Button variant="ghost" onClick={() => this.setState({ confirmReset: true })}>
              ローカルデータを初期化…
            </Button>
          ) : (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  resetAllLocalData(window.localStorage);
                  window.location.reload();
                }}
              >
                デッキ・記録・設定を全て消して初期化する
              </Button>
              <Button variant="ghost" onClick={() => this.setState({ confirmReset: false })}>
                やめる
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }
}
