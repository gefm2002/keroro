import { CartItem } from './cart'

export interface CheckoutData {
  items: CartItem[]
  customerName: string
  customerPhone: string
  customerAddress?: string
  notes?: string
  shippingPreference: 'pickup' | 'local' | 'shipping'
}

export function generateWhatsAppMessage(data: CheckoutData, whatsappNumber: string): string {
  const total = data.items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0)
  
  let message = `🛒 *Nuevo Pedido - Keroro Store*\n\n`
  message += `*Cliente:* ${data.customerName}\n`
  message += `*Teléfono:* ${data.customerPhone}\n`
  
  if (data.customerAddress) {
    message += `*Dirección:* ${data.customerAddress}\n`
  }
  
  const shippingText = {
    pickup: 'Retiro en local',
    local: 'Envío local',
    shipping: 'Envío a domicilio'
  }
  message += `*Envío:* ${shippingText[data.shippingPreference]}\n`
  
  if (data.notes) {
    message += `*Notas:* ${data.notes}\n`
  }
  
  message += `\n*Productos:*\n`
  data.items.forEach(item => {
    const subtotal = item.finalPrice * item.quantity
    message += `• ${item.name} x${item.quantity} - $${item.finalPrice.toLocaleString('es-AR')} c/u = $${subtotal.toLocaleString('es-AR')}\n`
  })
  
  message += `\n*Total: $${total.toLocaleString('es-AR')}*\n\n`
  message += `Gracias por tu compra! 🎉`
  
  return message
}

export function openWhatsApp(data: CheckoutData, whatsappNumber: string): void {
  const message = generateWhatsAppMessage(data, whatsappNumber)
  const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
