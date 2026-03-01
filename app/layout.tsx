import type { Metadata } from "next";
import { Quicksand, Tenor_Sans, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { PrivyProvider } from "@/components/providers/privy-provider";
import { ModalProvider } from "@/lib/contexts/modal-context";
import { AppShell } from "@/components/shared";
import { CookieConsentModal } from "@/components/cookie-consent-modal";
import { Toaster } from "sonner";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

const tenorSans = Tenor_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tenor",
  display: "swap",
});

// Using Caveat as a beautiful script font (similar to Lemon Tuesday style)
// To use actual Lemon Tuesday, replace with localFont import
const lemonTuesday = Caveat({
  subsets: ["latin"],
  variable: "--font-lemon",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.koruapp.xyz"),
  title: "Koru",
  description: "Pay for access. Earn for time.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Koru — Access shouldn't depend on luck",
    description:
      "A marketplace for high-intent conversations with experts and creators. Pay for access. Earn for time.",
    url: "https://www.koruapp.xyz",
    siteName: "Koru",
    images: [
      {
        url: "https://www.koruapp.xyz/banner.jpg",
        width: 1500,
        height: 609,
        alt: "Koru — Access shouldn't depend on luck. Koru makes it predictable.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Koru — Access shouldn't depend on luck",
    description:
      "A marketplace for high-intent conversations with experts and creators. Pay for access. Earn for time.",
    images: [
      {
        url: "https://www.koruapp.xyz/banner.jpg",
        width: 1500,
        height: 609,
        alt: "Koru — Access shouldn't depend on luck. Koru makes it predictable.",
      },
    ],
    creator: "@koruapp",
    site: "@koruapp",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Koru",
  url: "https://www.koruapp.xyz",
  logo: "https://www.koruapp.xyz/favicon.ico",
  description:
    "Pay for access. Earn for time. A marketplace for high-intent conversations with experts and creators.",
  sameAs: ["https://x.com/koruapp"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <meta
          property="twitter:image"
          content="https://www.koruapp.xyz/banner.jpg"
        />
        <meta
          name="twitter:image:src"
          content="https://www.koruapp.xyz/banner.jpg"
        />
        <meta property="twitter:url" content="https://www.koruapp.xyz" />
        <meta name="twitter:domain" content="www.koruapp.xyz" />
      </head>
      <body
        className={`${quicksand.variable} ${tenorSans.variable} ${lemonTuesday.variable} antialiased`}
      >
        <div
          className="koru-bg-decoration koru-bg-top-left"
          aria-hidden="true"
        />
        <div
          className="koru-bg-decoration koru-bg-bottom-right"
          aria-hidden="true"
        />

        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
          >
            <PrivyProvider>
              <ModalProvider>
                <AppShell>{children}</AppShell>
                <CookieConsentModal />
                <Toaster
                  position="bottom-right"
                  closeButton={false}
                  toastOptions={{
                    unstyled: true,
                  }}
                />
              </ModalProvider>
            </PrivyProvider>
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
