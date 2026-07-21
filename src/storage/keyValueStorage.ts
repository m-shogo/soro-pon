// storage層の抽象。テストではin-memory実装、アプリではwindow.localStorageを渡す。
// engineはこの層を知らない。
export type KeyValueStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

// quota超過などでsetItem/removeItemが失敗した場合に投げる。
// 生のDOMExceptionをUIまで伝播させず、呼び出し側が理解可能な
// メッセージへ変換して案内できるようにする(Gate 6 storage recovery)。
export class StorageWriteError extends Error {
  constructor(
    message: string,
    readonly cause: unknown,
  ) {
    super(message);
    this.name = 'StorageWriteError';
  }
}

// setItem/removeItemを安全に包む。失敗したらStorageWriteErrorへ変換する。
export function safeWrite(fn: () => void, message: string): void {
  try {
    fn();
  } catch (cause) {
    throw new StorageWriteError(message, cause);
  }
}

export function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}
