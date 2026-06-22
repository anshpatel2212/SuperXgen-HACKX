"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useDemoOffers } from "@/lib/demo-offers"
import type { Offer } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus, Tag, Trash2, Edit3, Check, X, Loader2, Percent, IndianRupee
} from "lucide-react"
import { SALONS } from "@/data"

const DEMO_CURRENT_DATE = "2026-06-22"
const EMPTY_FORM = {
  title: "",
  description: "",
  discount_type: "percentage" as Offer["discount_type"],
  discount_value: "",
  min_purchase: "0",
  max_discount: "0",
  coupon_code: "",
  valid_from: "",
  valid_till: "",
}

export default function OwnerOffersPage() {
  const { user, isLoading } = useAuth()
  const salons = SALONS.filter((salon) => salon.owner_id === user?.id)
  const [selectedSalonOverride, setSelectedSalonOverride] = useState("")
  const selectedSalonId = selectedSalonOverride || salons[0]?.id || ""
  const { offers, createOffer, updateOffer, deleteOffer } = useDemoOffers(selectedSalonId)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState("")

  if (isLoading) return null

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setFormError("")
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (offer: Offer) => {
    setForm({
      title: offer.title, description: offer.description, discount_type: offer.discount_type,
      discount_value: offer.discount_value.toString(), min_purchase: offer.min_purchase.toString(),
      max_discount: offer.max_discount.toString(), coupon_code: offer.coupon_code,
      valid_from: offer.valid_from, valid_till: offer.valid_till,
    })
    setEditingId(offer.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    const discountValue = Number(form.discount_value)
    if (!selectedSalonId || !form.title.trim() || !Number.isFinite(discountValue) || discountValue <= 0) {
      setFormError("Enter a title and a discount value greater than zero.")
      return
    }
    if (!form.valid_from || !form.valid_till || form.valid_from > form.valid_till) {
      setFormError("Choose a valid date range.")
      return
    }

    setSaving(true)
    try {
      const data = {
        title: form.title.trim(),
        description: form.description.trim(),
        discount_type: form.discount_type,
        discount_value: discountValue,
        min_purchase: Number(form.min_purchase) || 0,
        max_discount: Number(form.max_discount) || 0,
        coupon_code: form.coupon_code.trim().toUpperCase(),
        valid_from: form.valid_from,
        valid_till: form.valid_till,
      }
      if (editingId) {
        updateOffer(editingId, data)
      } else {
        createOffer({
          salon_id: selectedSalonId,
          ...data,
        })
      }
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this offer from the demo repository?")) return
    deleteOffer(id)
  }

  const toggleActive = (offer: Offer) => {
    updateOffer(offer.id, { is_active: !offer.is_active })
  }

  const isExpired = (validTill: string) => validTill < DEMO_CURRENT_DATE

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Offers & Promotions</h1>
          <p className="text-gray-500 text-sm">Create and manage special offers for your customers</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            value={selectedSalonId}
            onChange={e => setSelectedSalonOverride(e.target.value)}
          >
            {salons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <Button onClick={() => { resetForm(); setShowForm(true) }} className="gap-2 bg-pink-600 hover:bg-pink-700">
            <Plus className="w-4 h-4" /> New Offer
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-pink-200 bg-pink-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Title *</label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Summer Special" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Discount Type</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={form.discount_type}
                  onChange={e => setForm(p => ({ ...p, discount_type: e.target.value as Offer["discount_type"] }))}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Discount Value *</label>
                <Input type="number" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))} placeholder="20" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Min Purchase (₹)</label>
                <Input type="number" value={form.min_purchase} onChange={e => setForm(p => ({ ...p, min_purchase: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Max Discount (₹)</label>
                <Input type="number" value={form.max_discount} onChange={e => setForm(p => ({ ...p, max_discount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Coupon Code</label>
                <Input value={form.coupon_code} onChange={e => setForm(p => ({ ...p, coupon_code: e.target.value }))} placeholder="SUMMER20" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Valid From *</label>
                <Input type="date" value={form.valid_from} onChange={e => setForm(p => ({ ...p, valid_from: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Valid Till *</label>
                <Input type="date" value={form.valid_till} onChange={e => setForm(p => ({ ...p, valid_till: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-3">
                <label className="text-xs font-medium">Description</label>
                <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe this offer..." />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-pink-600 hover:bg-pink-700">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingId ? "Update" : "Create"} Offer
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {offers.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-500">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No offers yet</p>
          <p className="text-sm">Create your first offer to attract more customers.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {offers.map(offer => (
            <Card key={offer.id} className={`${isExpired(offer.valid_till) ? 'opacity-60' : ''}`}>
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{offer.title}</h3>
                    <Badge variant={offer.is_active ? "default" : "secondary"} className="text-xs">
                      {offer.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {isExpired(offer.valid_till) && (
                      <Badge variant="destructive" className="text-xs">Expired</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{offer.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      {offer.discount_type === 'percentage' ? <Percent className="w-3 h-3" /> : <IndianRupee className="w-3 h-3" />}
                      {offer.discount_type === 'percentage' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                    </span>
                    {offer.coupon_code && <Badge variant="outline" className="text-xs font-mono">{offer.coupon_code}</Badge>}
                    <span className="text-gray-400 text-xs">
                      {offer.valid_from} → {offer.valid_till}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(offer)}>
                    {offer.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(offer)}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(offer.id)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <p className="text-center text-xs text-gray-400">
        Offer changes persist in this browser for the hackathon demo.
      </p>
    </div>
  )
}
