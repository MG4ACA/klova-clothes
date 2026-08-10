/**
 * Returns a full image URL for a product image.
 * Backend images are served at /uploads/... — we need to prepend the API base URL.
 * External URLs (starting with http) are returned as-is.
 */
export const imageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  return `${base}${path}`
}

export const placeholderImg = (size = '400x400') =>
  `https://via.placeholder.com/${size}?text=No+Image`
