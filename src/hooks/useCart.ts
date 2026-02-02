import { useState, useEffect } from 'react'
import { getCart, getCartItemCount, getCartTotal, CartItem } from '../utils/cart'

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [total, setTotal] = useState(0)

  const refreshCart = () => {
    const currentCart = getCart()
    setCart(currentCart)
    setItemCount(getCartItemCount())
    setTotal(getCartTotal())
  }

  useEffect(() => {
    refreshCart()
    
    const handleStorageChange = () => {
      refreshCart()
    }
    
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(refreshCart, 500)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return { cart, itemCount, total, refreshCart }
}
