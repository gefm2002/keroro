/**
 * Obtiene la URL completa de una imagen
 * Maneja tanto rutas locales (/images/...) como rutas de Supabase Storage
 */
export function getImageUrl(path: string | undefined | null): string {
  if (!path) return '/images/placeholder.jpg'
  
  // Si es una URL completa (http/https), usarla directamente
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // Si empieza con /, es una ruta local
  if (path.startsWith('/')) {
    return path
  }
  
  // Si es una ruta de Supabase Storage (products/...), construir la URL completa
  if (path.startsWith('products/')) {
    const supabaseUrl = 'https://sfcxgbwrmwtvalllzhqv.supabase.co'
    return `${supabaseUrl}/storage/v1/object/public/keroro_products/${path}`
  }
  
  // Por defecto, asumir que es una ruta local
  return `/images/${path}`
}
