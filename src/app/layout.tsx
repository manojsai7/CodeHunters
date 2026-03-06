import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Code Hunters — Hunt the Skills. Build the Future.",
    template: "%s | Code Hunters",
  },
  description:
    "Premium programming courses and ready-to-use developer projects. Learn from industry experts, build real-world applications, and accelerate your dev career.",
  keywords: [
    "programming courses",
    "developer projects",
    "learn to code",
    "web development",
    "full stack",
    "React",
    "Next.js",
    "TypeScript",
    "edtech",
    "online learning",
    "code hunters",
  ],
  authors: [{ name: "Code Hunters Team" }],
  creator: "Code Hunters",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Code Hunters — Hunt the Skills. Build the Future.",
    description:
      "Premium programming courses and ready-to-use developer projects.",
    siteName: "Code Hunters",
  },
  twitter: {
    card: "summary_large_image",
    title: "Code Hunters — Hunt the Skills. Build the Future.",
    description:
      "Premium programming courses and ready-to-use developer projects.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body className={`${geist.variable} ${outfit.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0A0A0A",
              border: "1px solid #1E1E1E",
              color: "#FFFFFF",
            },
          }}
        />
      </body>
    </html>
  );
}
