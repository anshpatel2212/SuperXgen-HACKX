"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { FolderTree, Plus, Edit3, Trash2, Loader2 } from "lucide-react"
import { CATEGORIES } from "@/data"
import type { Category } from "@/types"

const ICON_OPTIONS = [
  "Sparkles", "Droplets", "Scissors", "Flower2", "Zap",
  "Hand", "Heart", "Sun", "Moon", "Star",
]

export default function AdminCategories() {
  const [isLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>(CATEGORIES)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<{ name: string; slug: string; description: string; icon: string }>({ name: "", slug: "", description: "", icon: "FolderTree" })

  const openAdd = () => {
    setEditingCategory(null)
    setForm({ name: "", slug: "", description: "", icon: "FolderTree" })
    setShowDialog(true)
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, icon: cat.icon })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: form.name, slug: form.slug, description: form.description, icon: form.icon }
            : c
        )
      )
    } else {
      const newCat: Category = {
        id: `c${Date.now()}`,
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
        description: form.description,
        icon: form.icon,
        image: "",
        service_count: 0,
      }
      setCategories((prev) => [...prev, newCat])
    }
    setIsSaving(false)
    setShowDialog(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await new Promise((r) => setTimeout(r, 400))
    setCategories((prev) => prev.filter((c) => c.id !== deleteId))
    setDeleteId(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Categories</h1>
        <LoadingSkeleton type="list" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage service categories
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="size-3.5" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories"
          description="Create your first category to organize services"
          actionLabel="Add Category"
          onAction={openAdd}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="group transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-glowgo-pink/10">
                      <FolderTree className="size-5 text-glowgo-pink" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{cat.name}</CardTitle>
                      <CardDescription className="text-[11px]">
                        {cat.service_count} service{cat.service_count !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {cat.description}
                </p>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Slug: /{cat.slug}
                </div>
              </CardContent>
              <CardFooter className="gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(cat)}
                >
                  <Edit3 className="size-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={() => setDeleteId(cat.id)}
                >
                  <Trash2 className="size-3" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update category details"
                : "Create a new service category"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                    slug: editingCategory
                      ? prev.slug
                      : e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }))
                }
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="category-slug"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={form.icon}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, icon: v || "FolderTree" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
