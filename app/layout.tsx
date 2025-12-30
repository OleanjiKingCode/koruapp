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
  title: "Koru",
  description: "Koru - Pay for access. Earn for time.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Koru",
    description: "Koru - Pay for access. Earn for time.",
    images: [
      {
        url: "/koruBanner.png",
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
    description: "Koru - Pay for access. Earn for time.",
    images: ["/koruBanner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
