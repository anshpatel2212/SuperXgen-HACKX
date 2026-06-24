"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SalonCard } from "@/components/salon/salon-card"
import { useAuth } from "@/lib/auth-context"
import { useDemoFavorites } from "@/lib/demo-favorites"
import { SALONS } from "@/data"

export default function FavoritesPage() {
  const { user } = useAuth()
  const { favoriteIds } = useDemoFavorites(user?.id)
  const [searchQuery, setSearchQuery] = useState("")
  const favorites = SALONS.filter((salon) => favoriteIds.includes(salon.id))

  const filtered = favorites.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.area.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
        <p className="text-sm text-gray-500 mt-1">Your saved salons for quick booking.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search favorites..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50">
              <Heart className="w-6 h-6 text-red-300" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {searchQuery ? "No matching salons" : "No favorites yet"}
          </h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            {searchQuery
              ? "Try a different search."
              : "Start exploring and save salons you love!"}
          </p>
          {!searchQuery && (
            <Link href="/explore">
              <Button className="bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm">
                Discover Salons
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((salon) => (
            <div key={salon.id}>
              <SalonCard salon={salon} />
            </div>
          ))}
        </div>
      )}

      {favorites.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Saved in this demo browser. Use the heart button to remove a salon.
        </p>
      )}
    </div>
  )
}
