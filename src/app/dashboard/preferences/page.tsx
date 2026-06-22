"use client"

import { useState, useEffect } from "react"
import { Sparkles, X, ChevronsUpDown, Check, Save, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from "@/components/ui/command"
import { cn, MUMBAI_AREAS } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const SKIN_TYPES = ["Normal", "Oily", "Dry", "Combination", "Sensitive"]
const HAIR_TYPES = ["Straight", "Wavy", "Curly", "Coily", "Thin", "Thick"]
const BEAUTY_GOALS = ["Anti-aging", "Brightening", "Acne Control", "Hydration", "Hair Growth", "Relaxation", "Weight Loss", "Detox"]
const PREFERRED_STYLES = ["Classic", "Trendy", "Minimalist", "Bold", "Natural", "Glamorous", "Bohemian", "Professional"]
const ALLERGIES = ["Fragrance", "Parabens", "Sulfates", "Nuts", "Latex", "Nickel", "Essential Oils"]
const BUDGET_RANGES = [
  { value: "budget", label: "Budget-friendly (₹300 - ₹1000)" },
  { value: "moderate", label: "Moderate (₹1000 - ₹3000)" },
  { value: "premium", label: "Premium (₹3000 - ₹8000)" },
  { value: "luxury", label: "Luxury (₹8000+)" },
]

const PREFS_KEY = "glowgo_beauty_preferences"

interface BeautyPreferences {
  skinType: string
  hairType: string
  beautyGoals: string[]
  preferredStyles: string[]
  allergies: string[]
  budgetRange: string
  preferredAreas: string[]
}

function loadPreferences(userId: string): BeautyPreferences {
  try {
    const raw = localStorage.getItem(`${PREFS_KEY}_${userId}`)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    skinType: "",
    hairType: "",
    beautyGoals: [],
    preferredStyles: [],
    allergies: [],
    budgetRange: "",
    preferredAreas: [],
  }
}

function savePreferences(userId: string, prefs: BeautyPreferences) {
  localStorage.setItem(`${PREFS_KEY}_${userId}`, JSON.stringify(prefs))
}

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder: string
}

function MultiSelect({ options, selected, onChange, placeholder }: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-1.5 text-sm shadow-sm hover:bg-muted h-auto min-h-8"
      >
        <div className="flex flex-wrap gap-1">
          {selected.length === 0 && (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          )}
          {selected.slice(0, 3).map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="bg-glowgo-pink/10 text-glowgo-pink text-[10px]"
            >
              {item}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleOption(item)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    toggleOption(item)
                  }
                }}
                className="ml-1 cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </span>
            </Badge>
          ))}
          {selected.length > 3 && (
            <Badge variant="secondary" className="text-[10px]">
              +{selected.length - 3} more
            </Badge>
          )}
        </div>
        <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => toggleOption(option)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected.includes(option)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50"
                    )}
                  >
                    {selected.includes(option) && <Check className="h-3 w-3" />}
                  </div>
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function PreferencesPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [skinType, setSkinType] = useState("")
  const [hairType, setHairType] = useState("")
  const [beautyGoals, setBeautyGoals] = useState<string[]>([])
  const [preferredStyles, setPreferredStyles] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [budgetRange, setBudgetRange] = useState("")
  const [preferredAreas, setPreferredAreas] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      const prefs = loadPreferences(user.id)
      setSkinType(prefs.skinType)
      setHairType(prefs.hairType)
      setBeautyGoals(prefs.beautyGoals)
      setPreferredStyles(prefs.preferredStyles)
      setAllergies(prefs.allergies)
      setBudgetRange(prefs.budgetRange)
      setPreferredAreas(prefs.preferredAreas)
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsLoading(true)
    savePreferences(user.id, {
      skinType,
      hairType,
      beautyGoals,
      preferredStyles,
      allergies,
      budgetRange,
      preferredAreas,
    })
    await new Promise((r) => setTimeout(r, 600))
    setIsLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">
        Please log in to manage your preferences.
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Beauty Preferences</h1>
        <p className="text-sm text-gray-500 mt-1">
          Help us personalize your experience. Your preferences power our AI recommendations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <Card className="border-gray-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-glowgo-pink" />
              <CardTitle>Skin & Hair Profile</CardTitle>
            </div>
            <CardDescription>Tell us about your skin and hair type for personalized recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Skin Type</Label>
                <Select value={skinType} onValueChange={(v) => v && setSkinType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skin type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKIN_TYPES.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Hair Type</Label>
                <Select value={hairType} onValueChange={(v) => v && setHairType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hair type" />
                  </SelectTrigger>
                  <SelectContent>
                    {HAIR_TYPES.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-glowgo-lavender" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <CardDescription>Select all that apply to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Beauty Goals</Label>
              <MultiSelect
                options={BEAUTY_GOALS}
                selected={beautyGoals}
                onChange={setBeautyGoals}
                placeholder="Select your goals..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Preferred Styles</Label>
              <MultiSelect
                options={PREFERRED_STYLES}
                selected={preferredStyles}
                onChange={setPreferredStyles}
                placeholder="Select styles..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Allergies / Sensitivities</Label>
              <MultiSelect
                options={ALLERGIES}
                selected={allergies}
                onChange={setAllergies}
                placeholder="Select allergies..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <CardTitle>Budget & Location</CardTitle>
            </div>
            <CardDescription>Set your preferred budget range and service areas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Budget Range</Label>
                <Select value={budgetRange} onValueChange={(v) => v && setBudgetRange(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Preferred Areas</Label>
              <MultiSelect
                options={MUMBAI_AREAS}
                selected={preferredAreas}
                onChange={setPreferredAreas}
                placeholder="Select areas in Mumbai..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Preferences saved
            </span>
          )}
          <div className="flex-1" />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Preferences
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
