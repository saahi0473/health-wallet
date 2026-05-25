import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Health Wallet – Your Personal Medical Records Hub",
    template: "%s | Health Wallet",
  },
  description:
    "Securely store, organize, and share your medical records, prescriptions, lab reports, and health documents in one place.",
  keywords: [
    "health records",
    "medical documents",
    "digital health wallet",
    "secure medical storage",
    "patient portal",
  ],
  authors: [{ name: "Health Wallet" }],
  creator: "Health Wallet",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://health-wallet.vercel.app",
    siteName: "Health Wallet",
    title: "Health Wallet – Your Personal Medical Records Hub",
    description:
      "Securely store, organize, and share your medical records, prescriptions, lab reports, and health documents in one place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Health Wallet – Your Personal Medical Records Hub",
    description:
      "Securely store, organize, and share your medical records, prescriptions, lab reports, and health documents in one place.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Suspense
          fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">
                Loading...
              </div>
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
