export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  finalPrice: number
  image: string
  quantity: number
}

const CART_KEY = 'keroro_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  const cart = localStorage.getItem(CART_KEY)
  return cart ? JSON.parse(cart) : []
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function addToCart(item: Omit<CartItem, 'quantity'>): void {
  const cart = getCart()
  const existing = cart.find(i => i.id === item.id)
  
  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ ...item, quantity: 1 })
  }
  
  saveCart(cart)
}

export function removeFromCart(itemId: string): void {
  const cart = getCart().filter(i => i.id !== itemId)
  saveCart(cart)
}

export function updateCartItemQuantity(itemId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(itemId)
    return
  }
  
  const cart = getCart()
  const item = cart.find(i => i.id === itemId)
  if (item) {
    item.quantity = quantity
    saveCart(cart)
  }
}

export function clearCart(): void {
  saveCart([])
}

export function getCartTotal(): number {
  return getCart().reduce((total, item) => total + item.finalPrice * item.quantity, 0)
}

export function getCartItemCount(): number {
  return getCart().reduce((count, item) => count + item.quantity, 0)
}
