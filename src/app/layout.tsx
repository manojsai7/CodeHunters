import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1A1A2E",
              border: "1px solid #2A2A3E",
              color: "#FFFFFF",
            },
          }}
        />
      </body>
    </html>
  );
}
