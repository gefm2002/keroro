import { X, Plus, Minus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { getCart, updateCartItemQuantity, removeFromCart, getCartTotal } from '../utils/cart'
import { formatPrice } from '../utils/format'
import { getImageUrl } from '../utils/images'
import { useEffect, useState } from 'react'

export default function CartDrawer() {
  const { isOpen, closeCart } = useCartStore()
  const [cart, setCart] = useState(getCart())
  const [total, setTotal] = useState(getCartTotal())


  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        const currentCart = getCart()
        setCart(currentCart)
        setTotal(getCartTotal())
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = cart.find(i => i.id === itemId)
    if (item) {
      updateCartItemQuantity(itemId, item.quantity + delta)
      const newCart = getCart()
      setCart(newCart)
      setTotal(getCartTotal())
    }
  }

  const handleRemove = (itemId: string) => {
    removeFromCart(itemId)
    const newCart = getCart()
    setCart(newCart)
    setTotal(getCartTotal())
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black z-50 transition-opacity"
        onClick={closeCart}
        style={{ opacity: 1 }}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface z-50 shadow-2xl flex flex-col transform transition-transform border-l border-primary-100">
        <div className="flex items-center justify-between p-4 border-b border-primary-100">
          <h2 className="text-xl font-display font-bold text-text">Carrito</h2>
          <button
            onClick={closeCart}
            className="p-2 text-muted hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted mb-4">Tu carrito está vacío</p>
              <Link
                to="/productos"
                onClick={closeCart}
                className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-bg rounded-xl border border-primary-100"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/productos/${item.slug}`}
                      onClick={closeCart}
                      className="font-semibold text-text hover:text-primary mb-1 block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-primary font-bold mb-2">
                      {formatPrice(item.finalPrice)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="p-1 rounded-lg bg-primary-100 text-primary hover:bg-primary-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="p-1 rounded-lg bg-primary-100 text-primary hover:bg-primary-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="ml-auto p-1 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-primary-100 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-text">Total:</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(total)}
              </span>
            </div>
            <Link
              to="/carrito"
              onClick={closeCart}
              className="block w-full bg-primary text-white text-center py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              Ir al checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
