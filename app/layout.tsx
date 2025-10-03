import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BuySell - Buy & Sell Anything Online",
  description: "The leading marketplace for buying and selling goods online",
  generator: "v0.dev",
  icons: {
    icon: [
      {
        url: "/favicon/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/favicon/favicon.svg",
    apple: "/favicon/favicon.svg",
  },
  manifest: "/favicon/site.webmanifest",
};

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="buysell-theme"
        >
          <Suspense fallback={<LoadingFallback />}>
            <AuthProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
              <Toaster />
            </AuthProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
