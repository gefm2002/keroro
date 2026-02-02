import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCart, updateCartItemQuantity, removeFromCart, getCartTotal, clearCart } from '../utils/cart'
import { formatPrice } from '../utils/format'
import { getImageUrl } from '../utils/images'
import { openWhatsApp } from '../utils/whatsapp'
import { supabase } from '../utils/supabase'
import { CartItem } from '../utils/cart'
import { CheckoutData } from '../utils/whatsapp'
import { Plus, Minus, Trash2, ArrowLeft, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Carrito() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [whatsapp, setWhatsapp] = useState('5491123989714')
  const [showCheckout, setShowCheckout] = useState(false)

  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    items: [],
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    notes: '',
    shippingPreference: 'pickup',
  })

  useEffect(() => {
    const loadCart = () => {
      const currentCart = getCart()
      setCart(currentCart)
      setTotal(getCartTotal())
    }
    loadCart()

    async function loadContact() {
      const { data } = await supabase
        .from('keroro_site_content')
        .select('data')
        .eq('id', 'contact')
        .single()
      
      if (data?.data?.whatsapp) {
        setWhatsapp(data.data.whatsapp.replace(/\D/g, ''))
      }
    }
    loadContact()

    const interval = setInterval(loadCart, 500)
    return () => clearInterval(interval)
  }, [])

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

  const handleCheckout = () => {
    if (!checkoutData.customerName || !checkoutData.customerPhone) {
      toast.error('Completá tu nombre y teléfono')
      return
    }
    checkoutData.items = cart
    openWhatsApp(checkoutData, whatsapp)
    clearCart()
    setCart([])
    setTotal(0)
    setShowCheckout(false)
    toast.success('¡Pedido enviado por WhatsApp!')
  }

  if (cart.length === 0 && !showCheckout) {
    return (
      <div className="min-h-screen bg-bg py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-display font-bold text-text mb-4">Tu carrito está vacío</h1>
          <p className="text-muted mb-8">Agregá productos para continuar</p>
          <Link
            to="/productos"
            className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Ver productos</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-text">Carrito</h1>
          <Link
            to="/productos"
            className="flex items-center space-x-2 text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Seguir comprando</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-surface rounded-xl p-6 border border-primary-100"
              >
                <div className="flex gap-4">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/productos/${item.slug}`}
                      className="font-semibold text-text hover:text-primary mb-2 block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-primary font-bold mb-4">
                      {formatPrice(item.finalPrice)}
                    </p>
                    <div className="flex items-center justify-between">
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
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-text">
                          {formatPrice(item.finalPrice * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-2 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-1">
            <div className="bg-surface rounded-xl p-6 border border-primary-100 sticky top-24">
              <h2 className="text-xl font-display font-bold text-text mb-4">Resumen</h2>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-muted">
                  <span>Subtotal:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-text font-bold text-lg pt-2 border-t border-primary-100">
                  <span>Total:</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {!showCheckout ? (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Finalizar compra</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={checkoutData.customerName}
                      onChange={(e) => setCheckoutData({ ...checkoutData, customerName: e.target.value })}
                      className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={checkoutData.customerPhone}
                      onChange={(e) => setCheckoutData({ ...checkoutData, customerPhone: e.target.value })}
                      className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Dirección (opcional)
                    </label>
                    <input
                      type="text"
                      value={checkoutData.customerAddress}
                      onChange={(e) => setCheckoutData({ ...checkoutData, customerAddress: e.target.value })}
                      className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Preferencia de envío
                    </label>
                    <select
                      value={checkoutData.shippingPreference}
                      onChange={(e) => setCheckoutData({ ...checkoutData, shippingPreference: e.target.value as any })}
                      className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="pickup">Retiro en local</option>
                      <option value="local">Envío local</option>
                      <option value="shipping">Envío a domicilio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={checkoutData.notes}
                      onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Enviar por WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="w-full text-muted hover:text-text py-2 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
