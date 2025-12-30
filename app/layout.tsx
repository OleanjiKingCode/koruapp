import type { Metadata } from "next";
import { Quicksand, Tenor_Sans, Caveat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://www.koruapp.xyz"),
  title: "Koru",
  description: "Pay for access. Earn for time.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Koru",
    description: "Pay for access. Earn for time.",
    url: "https://www.koruapp.xyz",
    siteName: "Koru",
    images: [
      {
        url: "https://www.koruapp.xyz/koruBanner.png",
        width: 1200,
        height: 630,
        alt: "Koru - Pay for access. Earn for time.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Koru",
    description: "Pay for access. Earn for time.",
    images: [
      {
        url: "https://www.koruapp.xyz/koruBanner.png",
        width: 1200,
        height: 630,
        alt: "Koru - Pay for access. Earn for time.",
      },
    ],
    creator: "@koruapp",
    site: "@koruapp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional Twitter meta tags for better compatibility */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Koru" />
        <meta
          property="twitter:description"
          content="Pay for access. Earn for time."
        />
        <meta
          property="twitter:image"
          content="https://www.koruapp.xyz/koruBanner.png"
        />
        <meta
          name="twitter:image:src"
          content="https://www.koruapp.xyz/koruBanner.png"
        />
        <meta property="twitter:url" content="https://www.koruapp.xyz" />
        <meta name="twitter:domain" content="www.koruapp.xyz" />
      </head>
      <body
        className={`${quicksand.variable} ${tenorSans.variable} ${lemonTuesday.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
