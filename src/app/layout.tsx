import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { TopNav } from "@/components/shared/top-nav"
import { Footer } from "@/components/shared/footer"
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav"
import { AppMain } from "@/components/shared/app-main"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-gray-900">
        <AuthProvider>
          <TopNav />
          <AppMain>{children}</AppMain>
          <Footer />
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  )
}
