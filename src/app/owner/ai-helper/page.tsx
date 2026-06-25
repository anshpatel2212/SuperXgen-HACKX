"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sparkles, Copy, Check,
  Loader2, Lightbulb, Wand2
} from "lucide-react"

export default function OwnerAIHelperPage() {
  const { user, isLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [input, setInput] = useState({
    salonName: "",
    area: "",
    specialties: "",
    gender: "unisex",
    priceRange: "",
    vibe: "",
    services: "",
  })
  const [output, setOutput] = useState({
    description: "",
    tagline: "",
    serviceDescriptions: [] as string[],
    seoCopy: "",
  })

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const generateDescription = async () => {
    setLoading(true)
    const name = input.salonName || "Your Salon"
    const area = input.area || "Mumbai"
    const gender = input.gender === "men" ? "men's" : input.gender === "women" ? "women's" : ""
    const specialties = input.specialties || "beauty services"
    const vibe = input.vibe || "welcoming"
    const genderPrefix = gender ? `${gender} ` : ""

    const desc = `${name} is a premier ${genderPrefix}beauty destination nestled in the heart of ${area}, offering an exquisite range of ${specialties}. Step into our ${vibe} sanctuary where every treatment is crafted to deliver visible, lasting results. Our team of highly skilled professionals combines artistry with advanced techniques, using only premium products to ensure an unparalleled experience. From the moment you walk in, you'll be enveloped in an ambiance of sophistication and care — because you deserve nothing less than radiant.`
    const tagline = specialties.includes("bridal") || specialties.includes("makeup")
      ? `Your ${area} Beauty Destination for ${specialties}`
      : `Where ${area} Comes to Glow`

    const seo = `${name} | Best ${genderPrefix}Salon in ${area}, Mumbai | ${specialties} | Book Online at GlowGo Mumbai`

    const serviceList = input.services
      ? input.services.split(",").map(s => s.trim()).filter(Boolean).map(svc =>
          `Experience our premium ${svc.toLowerCase()} — a transformative treatment delivered with precision and care. Our experts use advanced techniques to ensure you leave feeling refreshed, rejuvenized, and absolutely radiant.`
        )
      : []

    await new Promise(r => setTimeout(r, 800))

    setOutput({ description: desc, tagline, serviceDescriptions: serviceList, seoCopy: seo })
    setLoading(false)
  }

  if (isLoading) return null
  if (!user) redirect("/login")
  if (user.role !== "owner") redirect("/")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-pink-500" /> AI Content Studio
        </h1>
        <p className="text-gray-500 text-sm">Generate premium descriptions, taglines, and SEO copy for your salon</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Salon Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Salon Name</label>
                  <Input value={input.salonName} onChange={e => setInput(p => ({ ...p, salonName: e.target.value }))} placeholder="Glamour & Grace Salon" />
                </div>
                <div>
                  <label className="text-xs font-medium">Area / Location</label>
                  <Input value={input.area} onChange={e => setInput(p => ({ ...p, area: e.target.value }))} placeholder="Bandra West" />
                </div>
                <div>
                  <label className="text-xs font-medium">Specialties (comma separated)</label>
                  <Input value={input.specialties} onChange={e => setInput(p => ({ ...p, specialties: e.target.value }))} placeholder="bridal makeup, facials, hair styling" />
                </div>
                <div>
                  <label className="text-xs font-medium">Target Gender</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    value={input.gender}
                    onChange={e => setInput(p => ({ ...p, gender: e.target.value }))}
                  >
                    <option value="unisex">Unisex</option>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">Vibe / Ambiance</label>
                  <Input value={input.vibe} onChange={e => setInput(p => ({ ...p, vibe: e.target.value }))} placeholder="luxurious, modern, cozy" />
                </div>
                <div>
                  <label className="text-xs font-medium">Service Names (comma separated)</label>
                  <Input value={input.services} onChange={e => setInput(p => ({ ...p, services: e.target.value }))} placeholder="Classic Haircut, Bridal Makeup, Luxury Facial" />
                </div>
                <Button
                  onClick={generateDescription}
                  disabled={loading}
                  className="w-full gap-2 bg-gradient-to-r from-pink-600 to-purple-600"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {loading ? "Generating..." : "Generate Content"}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" /> AI-Generated Content
              </h3>
              {!output.description && !loading ? (
                <div className="text-center py-12 text-gray-400">
                  <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Enter your salon details and click generate to create AI-powered content.</p>
                </div>
              ) : loading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-purple-600">Tagline</span>
                      <button onClick={() => handleCopy(output.tagline, "tagline")} className="text-gray-400 hover:text-gray-600">
                        {copied === "tagline" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-sm bg-purple-50 rounded-lg p-3 border border-purple-100 italic">&ldquo;{output.tagline}&rdquo;</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-pink-600">Description</span>
                      <button onClick={() => handleCopy(output.description, "desc")} className="text-gray-400 hover:text-gray-600">
                        {copied === "desc" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 bg-pink-50 rounded-lg p-3 border border-pink-100">{output.description}</p>
                  </div>
                  {output.serviceDescriptions.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-blue-600">Service Descriptions ({output.serviceDescriptions.length})</span>
                      </div>
                      <div className="space-y-2">
                        {output.serviceDescriptions.map((desc, i) => (
                          <div key={i} className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3 border border-blue-100">
                            {desc}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-green-600">SEO Title Tag</span>
                      <button onClick={() => handleCopy(output.seoCopy, "seo")} className="text-gray-400 hover:text-gray-600">
                        {copied === "seo" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-sm font-mono bg-green-50 rounded-lg p-3 border border-green-100">{output.seoCopy}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Lightbulb className="w-8 h-8 text-yellow-500 shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">AI Content Tips</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Add your specific service names for tailored descriptions</li>
                <li>• The more details you provide, the better the AI output</li>
                <li>• You can copy and edit any generated content before saving</li>
                <li>• Use the SEO title tag to improve your salon&apos;s search ranking</li>
                <li>• Visit the Insights page for rule-based demo suggestions to grow your business</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
