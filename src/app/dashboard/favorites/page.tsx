"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Heart, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { SalonCard } from "@/components/salon/salon-card"
import { getUserFavorites, removeFavorite as removeFavoriteApi } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { SALONS } from "@/data"

const MOCK_FAVORITES = SALONS.slice(0, 4)

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState(MOCK_FAVORITES)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const favoriteIdMap = useRef<Record<string, string>>({})

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    getUserFavorites(user.id)
      .then((data) => {
        const items = data.favorites
        if (items.length > 0) {
          favoriteIdMap.current = {}
          items.forEach((f) => { favoriteIdMap.current[f.salon_id] = f.id })
          const salons = items
            .map((f) => SALONS.find((s) => s.id === f.salon_id))
            .filter((s): s is (typeof SALONS)[0] => !!s)
          setFavorites(salons)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [user])

  const filtered = favorites.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.area.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const removeFavorite = async (id: string) => {
    const favId = favoriteIdMap.current[id]
    if (favId && user) {
      try {
        await removeFavoriteApi(user.id, id)
        delete favoriteIdMap.current[id]
      } catch (err) {
        console.error("Failed to remove favorite:", err)
      }
    }
    setFavorites((prev) => prev.filter((s) => s.id !== id))
  }

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

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
            <div key={salon.id} className="relative group">
              <SalonCard salon={salon} />
              <button
                onClick={() => removeFavorite(salon.id)}
                className="absolute top-3 right-3 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                aria-label={`Remove ${salon.name} from favorites`}
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {favorites.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Hover over a card to remove from favorites
        </p>
      )}
    </div>
  )
}
