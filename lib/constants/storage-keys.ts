// Centralized localStorage keys
export const STORAGE_KEYS = {
  // Cookie consent
  COOKIE_PREFERENCES: "koru-cookie-preferences",
  COOKIE_CONSENT: "koru-cookie-consent-given",

  // User preferences
  FONT_PREFERENCE: "koru-font",

  // Chat/messaging
  SEEN_CHATS: "koru-seen-chats",

  // Booking
  BOOKING_PREFIX: "koru-booking-",
} as const;

// Helper function for booking storage key
export const getBookingStorageKey = (personId: string): string =>
  `${STORAGE_KEYS.BOOKING_PREFIX}${personId}`;

// Type for storage keys
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
