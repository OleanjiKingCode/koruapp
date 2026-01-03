"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_STORAGE_KEY = "koru-cookie-preferences";
const COOKIE_CONSENT_KEY = "koru-cookie-consent-given";

export function CookieConsentModal() {
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consentGiven = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consentGiven) {
      // Show modal after a short delay
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
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
    // Listen for custom event to open preferences
    const handleOpenPreferences = () => {
      setOpen(true);
    };

    window.addEventListener("koru-open-cookie-preferences", handleOpenPreferences);
    return () => {
      window.removeEventListener("koru-open-cookie-preferences", handleOpenPreferences);
    };
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
    setOpen(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    savePreferences(onlyNecessary);
    setOpen(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setOpen(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(prefs));
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    
    // Here you would typically initialize/update your analytics and marketing tools
    // based on the preferences
    if (prefs.analytics) {
      // Initialize analytics
      console.log("Analytics enabled");
    }
    if (prefs.marketing) {
      // Initialize marketing tools
      console.log("Marketing enabled");
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return; // Cannot toggle necessary cookies
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                Cookie Preferences
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                We use cookies to enhance your experience, analyze site usage, and assist in marketing efforts. 
                You can choose which cookies to accept.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Necessary Cookies */}
              <div className="rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">Necessary Cookies</h3>
                      <span className="rounded-full bg-koru-purple/15 px-2 py-1 text-xs text-koru-purple font-medium">
                        Always Active
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These cookies are essential for the Service to function. They enable core features like 
                      authentication, security, and session management. They cannot be disabled.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-koru-purple cursor-not-allowed opacity-60">
                      <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">Analytics Cookies</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These cookies help us understand how visitors interact with the Service by collecting and 
                      reporting information anonymously. This helps us improve the user experience.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePreference("analytics")}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-koru-purple focus:ring-offset-2",
                      preferences.analytics ? "bg-koru-purple" : "bg-neutral-300 dark:bg-neutral-700"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                        preferences.analytics ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="rounded-2xl border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">Marketing Cookies</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These cookies are used to deliver personalized advertisements and track campaign performance. 
                      They may be set by our advertising partners.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePreference("marketing")}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-koru-purple focus:ring-offset-2",
                      preferences.marketing ? "bg-koru-purple" : "bg-neutral-300 dark:bg-neutral-700"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                        preferences.marketing ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-koru-purple/20 bg-koru-purple/5 p-4">
                <p className="text-sm text-foreground/90">
                  <strong>Learn more:</strong> For detailed information about how we use cookies and manage your data, please contact support.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                onClick={handleRejectAll}
                className="flex-1"
              >
                Reject All
              </Button>
              <Button
                variant="outline"
                onClick={handleSavePreferences}
                className="flex-1"
              >
                Save Preferences
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="flex-1"
              >
                Accept All
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

