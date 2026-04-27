import { AIModel } from "@/lib/models";

export const GUEST_MAX_ATTEMPTS = 2;
export const GUEST_WINDOW_MS = 24 * 60 * 60 * 1000;
export const GUEST_USAGE_STORAGE_KEY = "guest-usage-state";

export const GUEST_DEFAULT_MODEL_NAME: AIModel = "Gemini 3 Flash Lite";
export const GUEST_DEFAULT_MODEL_ID = "google/gemini-3.1-flash-lite-preview";

export type GuestUsageState = {
  usedCount: number;
  maxCount: number;
  windowStartedAt: number | null;
  windowEndsAt: number | null;
  updatedAt: number;
};

function toSafeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function createInitialGuestUsageState(now = Date.now()): GuestUsageState {
  return {
    usedCount: 0,
    maxCount: GUEST_MAX_ATTEMPTS,
    windowStartedAt: null,
    windowEndsAt: null,
    updatedAt: now,
  };
}

export function parseGuestUsageState(value: unknown): GuestUsageState | null {
  const source = asRecord(value);
  if (!source) return null;

  const maxCount = toSafeNumber(source.maxCount, GUEST_MAX_ATTEMPTS);
  const sanitizedMaxCount = maxCount > 0 ? Math.floor(maxCount) : GUEST_MAX_ATTEMPTS;

  const usedCount = toSafeNumber(source.usedCount, 0);
  const sanitizedUsedCount = Math.max(0, Math.floor(usedCount));

  const windowStartedAt = source.windowStartedAt;
  const parsedWindowStartedAt =
    windowStartedAt === null
      ? null
      : typeof windowStartedAt === "number" && Number.isFinite(windowStartedAt)
        ? windowStartedAt
        : null;

  const windowEndsAt = source.windowEndsAt;
  const parsedWindowEndsAt =
    windowEndsAt === null
      ? null
      : typeof windowEndsAt === "number" && Number.isFinite(windowEndsAt)
        ? windowEndsAt
        : null;

  const updatedAt = toSafeNumber(source.updatedAt, Date.now());

  return {
    usedCount: Math.min(sanitizedUsedCount, sanitizedMaxCount),
    maxCount: sanitizedMaxCount,
    windowStartedAt: parsedWindowStartedAt,
    windowEndsAt: parsedWindowEndsAt,
    updatedAt,
  };
}

export function isGuestWindowExpired(state: GuestUsageState, now = Date.now()) {
  if (!state.windowEndsAt) return false;
  return now >= state.windowEndsAt;
}

export function resetIfExpired(state: GuestUsageState, now = Date.now()): GuestUsageState {
  const maxCount = state.maxCount > 0 ? state.maxCount : GUEST_MAX_ATTEMPTS;

  if (!isGuestWindowExpired(state, now)) {
    return {
      ...state,
      maxCount,
    };
  }

  return {
    usedCount: 0,
    maxCount,
    windowStartedAt: null,
    windowEndsAt: null,
    updatedAt: now,
  };
}

export function normalizeGuestUsage(
  value: GuestUsageState | unknown,
  now = Date.now()
): GuestUsageState {
  const parsed = parseGuestUsageState(value) ?? createInitialGuestUsageState(now);
  const normalized = resetIfExpired(parsed, now);

  return {
    ...normalized,
    usedCount: Math.min(normalized.usedCount, normalized.maxCount),
  };
}

export function canSendGuestMessage(state: GuestUsageState, now = Date.now()) {
  const normalized = normalizeGuestUsage(state, now);
  return normalized.usedCount < normalized.maxCount;
}

export function consumeGuestAttempt(state: GuestUsageState, now = Date.now()) {
  const normalized = normalizeGuestUsage(state, now);

  if (normalized.usedCount >= normalized.maxCount) {
    return {
      allowed: false,
      nextState: normalized,
    };
  }

  const isNewWindow =
    normalized.windowStartedAt === null || normalized.windowEndsAt === null;

  const windowStartedAt = isNewWindow ? now : normalized.windowStartedAt;
  const windowEndsAt = isNewWindow ? now + GUEST_WINDOW_MS : normalized.windowEndsAt;

  return {
    allowed: true,
    nextState: {
      ...normalized,
      usedCount: normalized.usedCount + 1,
      windowStartedAt,
      windowEndsAt,
      updatedAt: now,
    },
  };
}

export function getRemainingAttempts(state: GuestUsageState, now = Date.now()) {
  const normalized = normalizeGuestUsage(state, now);
  return Math.max(0, normalized.maxCount - normalized.usedCount);
}

export function getResetEta(state: GuestUsageState, now = Date.now()) {
  const normalized = normalizeGuestUsage(state, now);

  if (!normalized.windowEndsAt) return null;

  const remainingMs = normalized.windowEndsAt - now;
  return remainingMs > 0 ? remainingMs : 0;
}

export function readOrInitUsage(storage: Storage | null, now = Date.now()) {
  if (!storage) {
    return createInitialGuestUsageState(now);
  }

  try {
    const raw = storage.getItem(GUEST_USAGE_STORAGE_KEY);
    if (!raw) {
      const initial = createInitialGuestUsageState(now);
      storage.setItem(GUEST_USAGE_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed = parseGuestUsageState(JSON.parse(raw));
    const normalized = normalizeGuestUsage(parsed, now);
    storage.setItem(GUEST_USAGE_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    const fallback = createInitialGuestUsageState(now);
    storage.setItem(GUEST_USAGE_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

export function writeUsage(storage: Storage | null, state: GuestUsageState) {
  if (!storage) return;

  const normalized = normalizeGuestUsage(state);
  storage.setItem(GUEST_USAGE_STORAGE_KEY, JSON.stringify(normalized));
}
