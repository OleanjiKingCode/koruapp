// Application configuration constants
export const APP_CONFIG = {
  // Debounce timings (milliseconds)
  SEARCH_DEBOUNCE_MS: 300,
  FILTER_DEBOUNCE_MS: 400,
  COOKIE_MODAL_DELAY_MS: 1000,

  // Default values for availability
  DEFAULT_TIMEZONE: "America/New_York",
  DEFAULT_SLOT_DURATION_MIN: 30,
  DEFAULT_PRICE_USD: 50,
  DEFAULT_AVAILABILITY_DAYS: 14,

  // URL update debounce
  URL_UPDATE_DEBOUNCE_MS: 300,
} as const;

// Type for app config
export type AppConfigKey = keyof typeof APP_CONFIG;
