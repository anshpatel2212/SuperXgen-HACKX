"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, Menu, X, User, LogIn, LogOut, LayoutDashboard, Heart, Store, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { getInitials } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/owner", label: "For Owners" },
]

export function TopNav() {
  const { user, isLoading, logout } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)
  const pathname = usePathname()

  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password"

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-glowgo-pink to-glowgo-lavender">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="gradient-text">GlowGo</span>
                <span className="text-gray-700"> Mumbai</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-glowgo-pink after:transition-all hover:after:w-full"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar className="cursor-pointer ring-2 ring-glowgo-pink/30 hover:ring-glowgo-pink/60 transition-all">
                      <AvatarFallback className="bg-gradient-to-br from-glowgo-pink to-glowgo-lavender text-white text-xs">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.full_name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = "/dashboard/favorites"}>
                        <Heart className="w-4 h-4 mr-2" />
                        Favorites
                      </DropdownMenuItem>
                      {user.role === "owner" && (
                        <DropdownMenuItem onClick={() => window.location.href = "/owner"}>
                          <Store className="w-4 h-4 mr-2" />
                          My Salon
                        </DropdownMenuItem>
                      )}
                      {user.role === "admin" && (
                        <DropdownMenuItem onClick={() => window.location.href = "/admin"}>
                          <Shield className="w-4 h-4 mr-2" />
                          Admin
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : !isAuthPage ? (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm"
                    >
                      <LogIn className="w-3.5 h-3.5 mr-1" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : null}
            </div>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Menu">
                {sheetOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-6 mt-8">
                  {user && (
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-glowgo-pink to-glowgo-lavender text-white text-sm">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  )}
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSheetOpen(false)}
                      className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t pt-4 flex flex-col gap-3">
                    {user ? (
                      <>
                        <Link href="/dashboard" onClick={() => setSheetOpen(false)}>
                          <Button variant="outline" className="w-full justify-start">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full justify-start text-red-600" onClick={() => { logout(); setSheetOpen(false) }}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : !isAuthPage ? (
                      <>
                        <Link href="/login" onClick={() => setSheetOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Login
                          </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setSheetOpen(false)}>
                          <Button className="w-full bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white">
                            Sign Up
                          </Button>
                        </Link>
                      </>
                    ) : null}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  )
}
