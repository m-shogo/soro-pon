const MAX_SHARED_ID_LENGTH = 64;
let fallbackSequence = 0;

function runtimeEntropy(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // 非secure contextやブラウザ制限時は下のfallbackへ。
  }

  fallbackSequence = (fallbackSequence + 1) % Number.MAX_SAFE_INTEGER;
  return `${Date.now().toString(36)}-${fallbackSequence.toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

function sanitizeIdPart(raw: string): string {
  const safe = raw.replace(/[^A-Za-z0-9_-]/g, '');
  return safe.length > 0 ? safe : 'deck';
}

/**
 * 新規デッキ用の共有JSON互換IDを発行する。
 * UUIDを基本とし、既存IDとの衝突時は決定的な連番suffixで回避する。
 */
export function newDeckProjectId(
  existingIds: Iterable<string>,
  entropyFactory: () => string = runtimeEntropy,
): string {
  const existing = new Set(existingIds);
  const base = `created-${sanitizeIdPart(entropyFactory())}`.slice(0, MAX_SHARED_ID_LENGTH);
  if (!existing.has(base)) {
    return base;
  }

  let collisionIndex = 2;
  while (true) {
    const suffix = `-${collisionIndex}`;
    const candidate = `${base.slice(0, MAX_SHARED_ID_LENGTH - suffix.length)}${suffix}`;
    if (!existing.has(candidate)) {
      return candidate;
    }
    collisionIndex += 1;
  }
}
