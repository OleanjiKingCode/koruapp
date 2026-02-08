"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STORAGE_KEYS, APP_CONFIG } from "@/lib/constants";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

export function CookieConsentModal() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consentGiven = localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT);
    if (!consentGiven) {
      const timer = setTimeout(() => setShowBanner(true), APP_CONFIG.COOKIE_MODAL_DELAY_MS);
      return () => clearTimeout(timer);
    } else {
      const saved = localStorage.getItem(STORAGE_KEYS.COOKIE_PREFERENCES);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPreferences({ ...preferences, ...parsed });
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleOpenPreferences = () => {
      setShowBanner(true);
      setShowPreferences(true);
    };

    window.addEventListener("koru-open-cookie-preferences", handleOpenPreferences);
    return () => {
      window.removeEventListener("koru-open-cookie-preferences", handleOpenPreferences);
    };
  }, []);

  const handleAccept = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleDecline = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    savePreferences(onlyNecessary);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEYS.COOKIE_PREFERENCES, JSON.stringify(prefs));
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, "true");

    if (prefs.analytics) {
      console.log("Analytics enabled");
    }
    if (prefs.marketing) {
      console.log("Marketing enabled");
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-7xl mx-auto">
            <div
              className={cn(
                "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
                "rounded-xl shadow-lg px-6 py-4"
              )}
            >
              {!showPreferences ? (
                // Main banner
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 text-sm text-neutral-600 dark:text-neutral-400">
                    We use essential cookies to make our site work. With your consent, we may also use non-essential
                    cookies to improve user experience and analyze website traffic. For these reasons, we may share
                    your site usage data with our social media and analytics partners. By clicking &quot;Accept&quot;,
                    you agree to our website&apos;s cookie use as described in our{" "}
                    <button
                      onClick={() => setShowPreferences(true)}
                      className="text-koru-purple hover:underline font-medium"
                    >
                      Cookie Policy
                    </button>
                    . You can change your cookie settings at any time by clicking &quot;
                    <button
                      onClick={() => setShowPreferences(true)}
                      className="text-koru-purple hover:underline font-medium"
                    >
                      Preferences
                    </button>
                    &quot;.
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      variant="outline"
                      onClick={handleDecline}
                      className="min-w-[100px]"
                    >
                      Decline
                    </Button>
                    <Button
                      onClick={handleAccept}
                      className="min-w-[100px]"
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              ) : (
                // Preferences panel
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Cookie Preferences</h3>
                    <button
                      onClick={() => setShowPreferences(false)}
                      className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {/* Necessary */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                      <div>
                        <p className="font-medium text-sm text-foreground">Necessary</p>
                        <p className="text-xs text-neutral-500">Always active</p>
                      </div>
                      <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-koru-purple cursor-not-allowed opacity-60">
                        <span className="inline-block h-3.5 w-3.5 translate-x-5 rounded-full bg-white transition" />
                      </div>
                    </div>

                    {/* Analytics */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                      <div>
                        <p className="font-medium text-sm text-foreground">Analytics</p>
                        <p className="text-xs text-neutral-500">Site usage data</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePreference("analytics")}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          preferences.analytics ? "bg-koru-purple" : "bg-neutral-300 dark:bg-neutral-600"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                            preferences.analytics ? "translate-x-5" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </div>

                    {/* Marketing */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                      <div>
                        <p className="font-medium text-sm text-foreground">Marketing</p>
                        <p className="text-xs text-neutral-500">Personalized ads</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePreference("marketing")}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          preferences.marketing ? "bg-koru-purple" : "bg-neutral-300 dark:bg-neutral-600"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                            preferences.marketing ? "translate-x-5" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={handleDecline}>
                      Decline All
                    </Button>
                    <Button onClick={handleSavePreferences}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
