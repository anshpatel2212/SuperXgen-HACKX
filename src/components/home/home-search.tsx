"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Scissors, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HomeSearch() {
  const router = useRouter()
  const [city, setCity] = useState("Mumbai")
  const [query, setQuery] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (query.trim()) params.set("q", query.trim())
    router.push(`/explore?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-white/50 bg-white/80 p-2 shadow-lg backdrop-blur-xl sm:flex-row"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <select
          aria-label="Select city"
          className="h-11 w-full cursor-pointer appearance-none rounded-xl border-0 bg-transparent pl-10 pr-4 text-sm text-gray-700 outline-none"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        >
          <option>Mumbai</option>
          <option>Navi Mumbai</option>
          <option>Thane</option>
        </select>
      </div>
      <div className="relative flex-1">
        <Scissors className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search service or salon..."
          aria-label="Search service or salon"
          className="h-11 w-full rounded-xl border-0 bg-transparent pl-10 pr-4 text-sm text-gray-700 outline-none"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <Button
        type="submit"
        className="h-11 w-full rounded-xl bg-gradient-to-r from-glowgo-pink to-glowgo-lavender px-6 text-white shadow-sm hover:opacity-90 sm:w-auto"
      >
        Discover
        <ArrowRight className="ml-1.5 size-4" />
      </Button>
    </form>
  )
}
