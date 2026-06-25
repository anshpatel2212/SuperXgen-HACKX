import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { TopNav } from "@/components/shared/top-nav"
import { Footer } from "@/components/shared/footer"
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "GlowGo Mumbai - AI-Powered Beauty Salon Marketplace",
  description:
    "Discover top-rated salons, book AI-matched services, and experience beauty like never before in Mumbai. Your perfect look, just a tap away.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-gray-900">
        <AuthProvider>
          <TopNav />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  )
}
