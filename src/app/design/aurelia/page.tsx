"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  Scissors,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  ChevronRight,
  Star,
  Heart,
  Info,
  MapPin,
  Check,
  CheckCircle2,
  MessageSquare,
  Compass,
  Sliders,
  Award,
  DollarSign,
  Maximize2
} from "lucide-react"

// Types for Aurelia preview
interface SalonMock {
  id: string
  name: string
  area: string
  rating: number
  reviews: number
  priceRange: string
  matchScore: number
  gender: string
  image: string
  tagline: string
  services: string[]
}

const MOCK_SALONS: SalonMock[] = [
  {
    id: "a1",
    name: "Maison de L'Or (House of Gold)",
    area: "Colaba",
    rating: 4.9,
    reviews: 312,
    priceRange: "₹3,500 - ₹12,000",
    matchScore: 98,
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    tagline: "Gilded hair design and bespoke aesthetics",
    services: ["Gold Leaf Hair Therapy", "Bespoke Balayage", "Signature Royal Facial"],
  },
  {
    id: "a2",
    name: "The Obsidian Lounge",
    area: "Bandra West",
    rating: 4.8,
    reviews: 194,
    priceRange: "₹2,000 - ₹8,000",
    matchScore: 95,
    gender: "Men & Grooming",
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
    tagline: "High-contrast styling & wellness for the modern vanguard",
    services: ["Charcoal Beard Sculpting", "Classic Scissor Cut", "Obsidian Facial Ritual"],
  },
  {
    id: "a3",
    name: "Aura & Velvet Atelier",
    area: "Juhu",
    rating: 4.9,
    reviews: 428,
    priceRange: "₹4,000 - ₹18,000",
    matchScore: 92,
    gender: "Women",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    tagline: "Ultra-sensory bridal and holistic skincare and wellness",
    services: ["Velvet Bridal Makeup", "O2 Infusion Hydra-Facial", "Silk Weave Extension"],
  },
  {
    id: "a4",
    name: "Saffron & Pearl Sanctuary",
    area: "Powai",
    rating: 4.7,
    reviews: 156,
    priceRange: "₹2,500 - ₹7,000",
    matchScore: 89,
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
    tagline: "Ancient Ayurvedic therapy met with modern beauty tech",
    services: ["Saffron Face Brightening", "Pearl Essence Pedicure", "Deep Tissue Healing"],
  }
]

export default function AureliaPreviewPage() {
  const [activeTab, setActiveTab] = useState<"showcase" | "ai" | "booking" | "tokens">("showcase")
  const [favorites, setFavorites] = useState<string[]>([])
  
  // AI Simulation State
  const [aiPrompt, setAiPrompt] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string; data?: any }>>([
    {
      sender: "ai",
      text: "Welcome to Aurelia AI Stylist. I analyze salon capacity, customer reviews, and stylist specializations in real-time. Try asking me for a recommendation!",
    }
  ])

  // Booking Simulation State
  const [selectedDate, setSelectedDate] = useState("2026-06-27")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedStylist, setSelectedStylist] = useState("")

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fav => fav !== id))
    } else {
      setFavorites([...favorites, id])
    }
  }

  const handleAiPromptSubmit = (promptText: string) => {
    if (!promptText.trim()) return
    
    // Add user message
    const newHistory = [...chatHistory, { sender: "user" as const, text: promptText }]
    setChatHistory(newHistory)
    setAiPrompt("")
    setIsTyping(true)

    // Simulate AI response based on keywords
    setTimeout(() => {
      let responseText = "I couldn't find a direct matches for that query, but based on your luxury criteria, I recommend trying Maison de L'Or in Colaba for custom hair design."
      let recommendedSalons: SalonMock[] = []

      const query = promptText.toLowerCase()
      if (query.includes("bridal") || query.includes("juhu") || query.includes("wedding")) {
        responseText = "For luxury bridal and skin therapies, Aura & Velvet Atelier in Juhu is your ideal match. Customers praise their Velvet Bridal Makeup and sensory treatment rooms."
        recommendedSalons = [MOCK_SALONS[2]]
      } else if (query.includes("hair") || query.includes("balayage") || query.includes("colaba") || query.includes("gold")) {
        responseText = "Maison de L'Or in Colaba is showing exceptional ratings (4.9⭐) for custom hair color treatments. They currently have 2 open styling chairs for tomorrow afternoon."
        recommendedSalons = [MOCK_SALONS[0]]
      } else if (query.includes("grooming") || query.includes("beard") || query.includes("men") || query.includes("bandra")) {
        responseText = "The Obsidian Lounge in Bandra West specializes in high-end men's grooming. Stylist Rahul has an open slot at 4:30 PM with zero conflict buffer overlap."
        recommendedSalons = [MOCK_SALONS[1]]
      } else if (query.includes("spa") || query.includes("massage") || query.includes("powai")) {
        responseText = "I recommend Saffron & Pearl Sanctuary in Powai. They combine modern therapy with organic products and have high satisfaction score for body wellness."
        recommendedSalons = [MOCK_SALONS[3]]
      }

      setChatHistory([
        ...newHistory,
        {
          sender: "ai",
          text: responseText,
          data: recommendedSalons.length > 0 ? recommendedSalons : undefined
        }
      ])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#0b0807] text-[#f7f4f2] font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Gilded Top Mesh */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(197,160,89,0.12),transparent_60%)] pointer-events-none" />

      {/* Aurelia Preview Header */}
      <header className="sticky top-0 z-40 border-b border-[#2d221e] bg-[#0f0b09]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]">
              <Sparkles className="w-4 h-4 font-bold" />
            </div>
            <div>
              <span className="text-base font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300">
                AURELIA
              </span>
              <span className="text-[10px] text-amber-500 font-semibold ml-2 border border-amber-500/30 bg-amber-500/5 px-2 py-0.5 rounded-full">
                Design Identity Preview
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-[#cbbab4] hover:text-[#fffaf5] transition-colors"
            >
              Back to Live Site
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-400 bg-amber-500/5 border border-amber-500/20 mb-6">
            <Award className="w-3.5 h-3.5" /> High-Contrast Sensorial Marketplace
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-200">
            Reimagining Beauty Marketplace
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[#cbbab4] max-w-2xl mx-auto leading-relaxed">
            Welcome to the Aurelia preview canvas. This standalone route acts as a playground for our next-generation dark-mode aesthetics, featuring gold-leaf borders, glassmorphic filters, and interactive AI matching.
          </p>

          {/* Quick tab switcher */}
          <div className="mt-10 flex flex-wrap justify-center gap-2 p-1.5 bg-[#17110e] border border-[#2d221e] rounded-full max-w-md mx-auto">
            {[
              { id: "showcase", label: "Salon Cards", icon: Compass },
              { id: "ai", label: "AI Stylist", icon: Sparkles },
              { id: "booking", label: "Smart Scheduling", icon: Calendar },
              { id: "tokens", label: "Design System", icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg"
                      : "text-[#cbbab4] hover:text-[#fffaf5] hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        
        {/* Tab 1: Card Showcase */}
        {activeTab === "showcase" && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-amber-200">Featured Aurelia Cards</h2>
              <p className="text-xs text-[#cbbab4] mt-1">Staggered border radius, translucent backgrounds, and gold matching indicators.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {MOCK_SALONS.map((salon) => (
                <div
                  key={salon.id}
                  className="group relative flex flex-col overflow-hidden rounded-[1.65rem] border border-[#2d221e] bg-[#120d0b]/80 backdrop-blur-xl hover:border-amber-500/40 transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
                >
                  {/* Card Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={salon.image}
                      alt={salon.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Match Score Badge */}
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#0b0807]/90 px-2.5 py-1 text-[10px] font-bold text-amber-400 border border-amber-500/30 backdrop-blur-md">
                      <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                      {salon.matchScore}% Match
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(salon.id)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#0b0807]/80 text-[#cbbab4] hover:text-[#fffaf5] border border-[#2d221e] hover:border-amber-500/30 transition-all backdrop-blur-md"
                    >
                      <Heart
                        className={`h-4.5 w-4.5 ${
                          favorites.includes(salon.id) ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </button>

                    {/* Bottom Gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#120d0b] to-transparent" />
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                        {salon.area}
                      </span>
                      <div className="flex items-center gap-0.5 text-xs text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span className="font-bold">{salon.rating}</span>
                        <span className="text-[10px] text-[#9f8981]">({salon.reviews})</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#fffaf5] group-hover:text-amber-200 transition-colors">
                      {salon.name}
                    </h3>
                    <p className="text-[11px] text-[#cbbab4] italic mt-1 leading-relaxed">
                      "{salon.tagline}"
                    </p>

                    {/* Tags / Badges */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {salon.services.slice(0, 2).map((serv) => (
                        <span
                          key={serv}
                          className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-medium text-[#cbbab4]"
                        >
                          {serv}
                        </span>
                      ))}
                    </div>

                    {/* Price Range & Action */}
                    <div className="mt-auto pt-4 border-t border-[#2d221e] flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] text-[#cbbab4] uppercase tracking-wider">Starting at</span>
                        <span className="text-xs font-extrabold text-amber-200">{salon.priceRange.split("-")[0]}</span>
                      </div>

                      <button className="flex items-center gap-1.5 text-[11px] font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 group-hover:from-amber-300 group-hover:to-amber-400 px-3.5 py-1.5 rounded-full transition-all shadow-[0_4px_12px_rgba(197,160,89,0.2)]">
                        Explore
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: AI Stylist Chat Simulation */}
        {activeTab === "ai" && (
          <div className="grid gap-6 lg:grid-cols-3 max-w-4xl mx-auto animate-fade-in">
            {/* Left Column: Sample Prompts */}
            <div className="lg:col-span-1 space-y-4">
              <div className="rounded-[1.4rem] border border-[#2d221e] bg-[#120d0b]/80 p-5 shadow-lg">
                <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Stylist Prompts
                </h3>
                <p className="text-[11px] text-[#cbbab4] mt-1 leading-relaxed">
                  Click any pre-configured question to test the Aurelia recommendation engine.
                </p>
                
                <div className="mt-4 space-y-2">
                  {[
                    "I want a premium wedding/bridal look in Juhu",
                    "Any luxury haircut options in Colaba?",
                    "Where can I find premium men's grooming in Bandra?",
                    "Recommend a relaxation body massage in Powai"
                  ].map((p) => (
                    <button
                      key={p}
                      onClick={() => handleAiPromptSubmit(p)}
                      disabled={isTyping}
                      className="w-full text-left p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-amber-500/5 hover:border-amber-500/20 text-[11px] font-medium text-[#cbbab4] hover:text-[#fffaf5] transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Chat Box */}
            <div className="lg:col-span-2 flex flex-col h-[420px] rounded-[1.4rem] border border-[#2d221e] bg-[#120d0b]/80 overflow-hidden shadow-lg">
              {/* Chat Header */}
              <div className="flex items-center gap-2 border-b border-[#2d221e] bg-white/5 px-4 py-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Aurelia AI Assistant</span>
              </div>

              {/* Message History */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-none">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto" : "mr-auto"}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-amber-500 text-black font-semibold rounded-tr-none"
                          : "bg-white/5 border border-white/10 text-[#f7f4f2] rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* If there's structured data payload attached */}
                    {msg.data && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {msg.data.map((salon: SalonMock) => (
                          <div
                            key={salon.id}
                            className="rounded-xl border border-white/10 bg-black/40 overflow-hidden p-3 flex gap-2.5 hover:border-amber-500/20 transition-all"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={salon.image}
                              alt={salon.name}
                              className="w-14 h-14 object-cover rounded-lg shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-[11px] font-bold text-[#fffaf5] truncate">{salon.name}</h4>
                              <p className="text-[9px] text-[#cbbab4]">{salon.area}</p>
                              <div className="flex items-center gap-1 mt-1 text-[9px] text-amber-400">
                                <Star className="w-2.5 h-2.5 fill-amber-400" />
                                <span>{salon.rating}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="mr-auto max-w-[85%] bg-white/5 border border-white/10 text-[#f7f4f2] p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#cbbab4] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#cbbab4] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#cbbab4] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-[#2d221e]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleAiPromptSubmit(aiPrompt)
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={isTyping}
                    placeholder="Ask about bridal makeups, premium haircuts, locations..."
                    className="flex-1 min-h-10 rounded-full border border-white/10 bg-[#0f0b09] px-4 text-xs focus:outline-none focus:border-amber-500/30 text-[#f7f4f2]"
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !aiPrompt.trim()}
                    className="min-h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-4 text-xs transition-all disabled:opacity-40"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Smart Scheduling */}
        {activeTab === "booking" && (
          <div className="max-w-3xl mx-auto grid gap-6 md:grid-cols-2 animate-fade-in">
            {/* Slot selector Card */}
            <div className="rounded-[1.4rem] border border-[#2d221e] bg-[#120d0b]/80 p-5 shadow-lg space-y-4">
              <h3 className="text-base font-bold text-amber-200">Configure Reservation</h3>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#cbbab4]">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full flex h-10 rounded-xl border border-white/10 bg-[#0f0b09] px-3 py-2 text-xs focus:outline-none focus:border-amber-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#cbbab4]">Select Stylist</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "st1", name: "Vikram Sen", title: "Master Haircut Expert" },
                    { id: "st2", name: "Priya Rao", title: "Bridal Specialist" },
                  ].map((stylist) => (
                    <button
                      key={stylist.id}
                      onClick={() => setSelectedStylist(stylist.id)}
                      className={`text-left p-2.5 rounded-xl border transition-all ${
                        selectedStylist === stylist.id
                          ? "border-amber-500 bg-amber-500/10 text-amber-200"
                          : "border-white/5 bg-[#0f0b09] text-[#cbbab4] hover:bg-white/5"
                      }`}
                    >
                      <p className="text-xs font-bold">{stylist.name}</p>
                      <p className="text-[9px] text-[#9f8981] mt-0.5">{stylist.title}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#cbbab4]">Choose Available Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {["09:00 AM", "10:30 AM", "12:00 PM", "01:30 PM", "03:00 PM", "04:30 PM", "06:00 PM", "07:30 PM"].map((slot) => {
                    const isBooked = slot === "12:00 PM" || slot === "03:00 PM"
                    const isSelected = selectedTime === slot
                    return (
                      <button
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-1 rounded-xl text-[10px] font-semibold transition-all border ${
                          isBooked
                            ? "bg-red-500/5 text-red-400/50 border-red-500/10 cursor-not-allowed line-through"
                            : isSelected
                              ? "border-amber-500 bg-amber-500/10 text-amber-200"
                              : "border-white/5 bg-[#0f0b09] text-[#cbbab4] hover:bg-white/5"
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Smart Capacity Preview Card */}
            <div className="rounded-[1.4rem] border border-[#2d221e] bg-[#120d0b]/80 p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-amber-200 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Conflict-Free Guarantee
                </h3>
                <p className="text-[11px] text-[#cbbab4] mt-1">
                  Aurelia's engine calculates real-time buffer slots to prevent scheduling overlays.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center text-xs pb-2.5 border-b border-[#2d221e]">
                    <span className="text-[#cbbab4]">Treatment Duration</span>
                    <span className="font-semibold text-white">45 mins</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs pb-2.5 border-b border-[#2d221e]">
                    <span className="text-[#cbbab4]">Required Buffer Time</span>
                    <span className="font-semibold text-[#8f6b25]">15 mins (Post-clean)</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#cbbab4]">Total Slot Reserved</span>
                    <span className="font-semibold text-white">60 mins total</span>
                  </div>
                </div>

                <div className="mt-6 p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-[10px] text-emerald-300 leading-relaxed">
                    <strong>Capacity Available</strong>: This stylist has no overlapping bookings, and a 15-minute post-service buffer is safely allocated.
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#2d221e] flex flex-col gap-2">
                <button
                  disabled={!selectedTime || !selectedStylist}
                  className="w-full flex items-center justify-center gap-2 min-h-11 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(197,160,89,0.3)]"
                >
                  Book Luxury Session
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Design Primitives & Tokens */}
        {activeTab === "tokens" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Color Swatches */}
            <div className="rounded-[1.4rem] border border-[#2d221e] bg-[#120d0b]/80 p-6 shadow-lg">
              <h3 className="text-base font-bold text-amber-200 mb-4">Aurelia Gilded Palette</h3>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                {[
                  { name: "Obsidian (Base)", value: "#0b0807", usage: "Page Backgrounds" },
                  { name: "Lustrous Gold", value: "#cbbab4", usage: "Muted Text & Borders", hexOverride: "#d7b982" },
                  { name: "Gilded Amber", value: "#d97706", hexOverride: "#f59e0b", usage: "Buttons, Highlights" },
                  { name: "Velvet Rose", value: "#db2777", usage: "Premium Badges & Actions" },
                ].map((color) => (
                  <div key={color.name} className="flex flex-col gap-2 p-2 rounded-xl border border-white/5 bg-black/20">
                    <div
                      className="w-full aspect-[2/1] rounded-lg border border-white/15 shadow-inner"
                      style={{ backgroundColor: color.hexOverride || color.value }}
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{color.name}</p>
                      <p className="text-[10px] text-amber-500/80 font-mono mt-0.5">{color.hexOverride || color.value}</p>
                      <p className="text-[9px] text-[#9f8981] mt-0.5">{color.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Button Specifications */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-[#2d221e] bg-[#120d0b]/80 p-6 shadow-lg space-y-4">
                <h3 className="text-base font-bold text-amber-200">Interactive Buttons</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs text-[#cbbab4] font-mono">.btn-gilded</span>
                    <button className="min-h-9 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-[11px] px-4 shadow-[0_4px_12px_rgba(197,160,89,0.2)]">
                      Reserve Slot
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs text-[#cbbab4] font-mono">.btn-glass</span>
                    <button className="min-h-9 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-300 font-bold text-[11px] px-4 backdrop-blur-md">
                      View Menu
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs text-[#cbbab4] font-mono">.btn-ghost</span>
                    <button className="min-h-9 text-[#cbbab4] hover:text-[#fffaf5] font-bold text-[11px] px-4">
                      Cancel Request
                    </button>
                  </div>
                </div>
              </div>

              {/* Typography specimens */}
              <div className="rounded-[1.4rem] border border-[#2d221e] bg-[#120d0b]/80 p-6 shadow-lg space-y-4">
                <h3 className="text-base font-bold text-amber-200">Typography Scale</h3>
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#2d221e]">
                    <span className="block text-[9px] text-[#9f8981] font-mono mb-1">Aurelia Heading XL (Outfit / Playfair)</span>
                    <span className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-100 to-yellow-50">
                      Gilded Luxury
                    </span>
                  </div>
                  <div className="pb-2 border-b border-[#2d221e]">
                    <span className="block text-[9px] text-[#9f8981] font-mono mb-1">Aurelia Section Title</span>
                    <span className="text-lg font-bold text-amber-200">
                      Featured Sanctuary List
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-[#9f8981] font-mono mb-1">Body Text (Inter)</span>
                    <span className="text-xs text-[#cbbab4] leading-relaxed">
                      Sensory design features translucent background cards met with low-contrast custom controls and gold accents.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Standalone Footer */}
      <footer className="border-t border-[#2d221e] bg-[#0c0908] text-[#cbbab4] py-8 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="font-semibold text-[#fffaf5]">GlowGo Aurelia Design Concept</span>
          </div>
          <p>© 2026 GlowGo Mumbai. Static layout preview, all rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
