"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Bell,
  Lock,
  Globe,
  MapPin,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { MUMBAI_AREAS } from "@/lib/utils"

const SETTINGS_KEY = "glowgo_user_settings"

interface UserSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  whatsappNotifications: boolean
  marketingEmails: boolean
  theme: string
  language: string
  primaryLocation: string
}

const DEFAULT_SETTINGS: UserSettings = {
  emailNotifications: true,
  smsNotifications: true,
  whatsappNotifications: false,
  marketingEmails: true,
  theme: "light",
  language: "English",
  primaryLocation: "Bandra",
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    if (!user) return
    try {
      const stored = localStorage.getItem(`${SETTINGS_KEY}_${user.id}`)
      if (stored) {
        setSettings(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Failed to load settings:", e)
    }
  }, [user])

  if (!user) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">
        Please log in to manage your settings.
      </div>
    )
  }

  const handleSaveSettings = () => {
    setIsSaving(true)
    setSaved(false)
    try {
      localStorage.setItem(`${SETTINGS_KEY}_${user.id}`, JSON.stringify(settings))
      setTimeout(() => {
        setIsSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }, 800)
    } catch (e) {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordStatus(null)

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordStatus({ type: "error", message: "All fields are required." })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "New password must be at least 6 characters." })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Passwords do not match." })
      return
    }

    setIsUpdatingPassword(true)
    setTimeout(() => {
      setIsUpdatingPassword(false)
      setPasswordStatus({ type: "success", message: "Password updated successfully!" })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => setPasswordStatus(null), 3000)
    }, 1000)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your notifications, security, and account preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side Navigation (visual context) */}
        <div className="md:col-span-1 space-y-2">
          <div className="rounded-2xl border border-[#ead8c5] bg-[#fffcf9] p-4 space-y-1">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl bg-glowgo-pink/10 text-glowgo-pink text-left">
              <Settings className="w-4 h-4" />
              General
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-50 text-left cursor-default">
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-50 text-left cursor-default">
              <Lock className="w-4 h-4" />
              Security
            </button>
          </div>
        </div>

        {/* Right Side Settings Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Notification Preferences */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-glowgo-pink" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Control which channels we use to reach out to you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notif" className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-gray-500">Appointment updates, booking receipts, and notes.</p>
                </div>
                <Switch
                  id="email-notif"
                  checked={settings.emailNotifications}
                  onCheckedChange={(val) => setSettings((s) => ({ ...s, emailNotifications: val }))}
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notif" className="text-sm font-medium">SMS Notifications</Label>
                  <p className="text-xs text-gray-500">Immediate confirmations and reminders.</p>
                </div>
                <Switch
                  id="sms-notif"
                  checked={settings.smsNotifications}
                  onCheckedChange={(val) => setSettings((s) => ({ ...s, smsNotifications: val }))}
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="space-y-0.5">
                  <Label htmlFor="wa-notif" className="text-sm font-medium">WhatsApp Alerts</Label>
                  <p className="text-xs text-gray-500">Booking notifications directly on WhatsApp.</p>
                </div>
                <Switch
                  id="wa-notif"
                  checked={settings.whatsappNotifications}
                  onCheckedChange={(val) => setSettings((s) => ({ ...s, whatsappNotifications: val }))}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="mktg-emails" className="text-sm font-medium">Marketing Communications</Label>
                  <p className="text-xs text-gray-500">Exclusive promotions, festival coupons, and newsletter.</p>
                </div>
                <Switch
                  id="mktg-emails"
                  checked={settings.marketingEmails}
                  onCheckedChange={(val) => setSettings((s) => ({ ...s, marketingEmails: val }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences & Localization */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-glowgo-pink" />
                Localization & Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Set defaults for your local experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(val) => val && setSettings((s) => ({ ...s, language: val }))}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">हिन्दी (Hindi)</SelectItem>
                      <SelectItem value="Marathi">मराठी (Marathi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="theme">App Theme</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(val) => val && setSettings((s) => ({ ...s, theme: val }))}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="dark">Dark Mode (Beta)</SelectItem>
                      <SelectItem value="system">Follow System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Primary Search Location
                </Label>
                <Select
                  value={settings.primaryLocation}
                  onValueChange={(val) => val && setSettings((s) => ({ ...s, primaryLocation: val }))}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select Area" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUMBAI_AREAS.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area} (Mumbai)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-gray-500 mt-1">We will prioritize search results from this location on your home page.</p>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-glowgo-pink to-rose-500 text-white min-h-10 rounded-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Preferences Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security & Password */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-glowgo-pink" />
                Change Password
              </CardTitle>
              <CardDescription className="text-xs">
                Keep your account secure by using a strong password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="curr-pass">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="curr-pass"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-pass">New Password</Label>
                    <Input
                      id="new-pass"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="conf-pass">Confirm New Password</Label>
                    <Input
                      id="conf-pass"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>

                {passwordStatus && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                      passwordStatus.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                        : "bg-red-50 text-red-800 border border-red-100"
                    }`}
                  >
                    {passwordStatus.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                    )}
                    {passwordStatus.message}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isUpdatingPassword}
                    variant="outline"
                    className="min-h-10 rounded-full"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-100 bg-red-50/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-xs text-red-700/80">
                Permanently delete or disable your GlowGo account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                <div>
                  <p className="text-sm font-semibold text-red-900">Deactivate Customer Profile</p>
                  <p className="text-xs text-red-700/80 mt-0.5">
                    Your preferences, bookings, and favorites will be frozen. You can reactivate anytime.
                  </p>
                </div>
                <Button variant="destructive" size="sm" className="rounded-full shrink-0">
                  Deactivate Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
