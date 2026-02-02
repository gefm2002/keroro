export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function calculateFinalPrice(
  price: number,
  offerType: string,
  offerValue: number | null
): number {
  if (!offerValue || offerType === 'none') {
    return price
  }
  
  switch (offerType) {
    case 'percent':
      return price * (1 - offerValue / 100)
    case 'fixed':
      return Math.max(0, price - offerValue)
    case 'final':
      return offerValue
    default:
      return price
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
