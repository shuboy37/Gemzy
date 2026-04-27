import {
  GUEST_DEFAULT_MODEL_NAME,
  GUEST_MAX_ATTEMPTS,
} from "@/lib/guest/guest-usage";

export const GUEST_COPY = {
  sidebarWelcome:
    "Welcome to Gemzy! You can send up to 2 free messages to try our AI assistant.",
  sidebarBenefits:
    "Sign up for unlimited conversations, conversation history, and access to all features.",
  limitReached:
    "You have used all 2 free messages. Sign up or log in to continue.",
  guestModelLine: `Using ${GUEST_DEFAULT_MODEL_NAME} • Sign up for more models`,
} as const;

export function formatGuestUsage(usedCount: number, maxCount = GUEST_MAX_ATTEMPTS) {
  const safeUsed = Math.max(0, usedCount);
  const safeMax = Math.max(1, maxCount);
  return `${safeUsed}/${safeMax} free messages used`;
}
