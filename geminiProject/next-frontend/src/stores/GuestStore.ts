import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import {
  createInitialGuestUsageState,
  getRemainingAttempts,
  normalizeGuestUsage,
  type GuestUsageState,
} from "@/lib/guest/guest-usage";

export const guestUsageAtom = atomWithStorage<GuestUsageState>(
  "guest-usage-state",
  createInitialGuestUsageState()
);

export const guestUsageSnapshotAtom = atom((get) =>
  normalizeGuestUsage(get(guestUsageAtom))
);

export const guestRemainingAttemptsAtom = atom((get) =>
  getRemainingAttempts(get(guestUsageSnapshotAtom))
);

export const syncGuestUsageAtom = atom(null, (get, set) => {
  const nextState = normalizeGuestUsage(get(guestUsageAtom));
  set(guestUsageAtom, nextState);
});
