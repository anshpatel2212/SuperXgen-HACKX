const ALLOWED_REMOTE_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "plus.unsplash.com",
  "picsum.photos",
])

export function isAllowedGlowImageUrl(value?: string | null) {
  if (!value) return false
  const trimmed = value.trim()
  if (!trimmed) return false
  if (trimmed.startsWith("/") || trimmed.startsWith("data:image/") || trimmed.startsWith("blob:")) {
    return true
  }

  try {
    const url = new URL(trimmed)
    return url.protocol === "https:" && ALLOWED_REMOTE_IMAGE_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

export function cleanGlowImageUrls(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim() || "")
        .filter((value) => isAllowedGlowImageUrl(value))
    )
  )
}
