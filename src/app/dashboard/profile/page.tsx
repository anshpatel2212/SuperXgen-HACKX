"use client"

import { useState } from "react"
import { User, Mail, Phone, Camera, Save, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { getInitials } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import type { AuthUser } from "@/types"

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()

  if (!user) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">
        Please log in to manage your profile.
      </div>
    )
  }

  return <ProfileForm key={user.id} user={user} updateProfile={updateProfile} />
}

function ProfileForm({
  user,
  updateProfile,
}: {
  user: AuthUser
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState(() => ({
    fullName: user.full_name || "",
    email: user.email || "",
    phone: user.phone || "",
  }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSaved(false)
    const result = await updateProfile({
      full_name: formData.fullName,
      phone: formData.phone,
    })
    setIsLoading(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information.</p>
      </div>

      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b border-gray-50">
            <div className="relative group">
              <Avatar className="w-20 h-20">
                <AvatarImage src="" alt={formData.fullName} />
                <AvatarFallback className="bg-gradient-to-br from-glowgo-pink to-glowgo-lavender text-white text-xl">
                  {getInitials(formData.fullName || "U")}
                </AvatarFallback>
              </Avatar>
              <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-gray-900">{formData.fullName || "User"}</h3>
              <p className="text-sm text-gray-500">Customer</p>
              <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
                <Camera className="w-3.5 h-3.5 mr-1" />
                Change Photo
              </Button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="fullName"
                  className="pl-9"
                  value={formData.fullName}
                  onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  value={formData.email}
                  disabled
                />
              </div>
              <p className="text-xs text-gray-400">Email cannot be changed.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  className="pl-9"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Profile saved successfully
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
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
