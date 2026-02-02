import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { ContactData, PaymentMethod } from '../types'
import { MessageCircle, Instagram, MapPin, Clock, Send, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Contacto() {
  const [contact, setContact] = useState<ContactData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  useEffect(() => {
    async function loadContact() {
      const { data } = await supabase
        .from('keroro_site_content')
        .select('data')
        .eq('id', 'contact')
        .single()
      
      if (data) {
        setContact(data.data as ContactData)
      }
    }
    loadContact()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.message) {
      toast.error('Completá tu nombre y mensaje')
      return
    }

    if (!contact?.whatsapp) {
      toast.error('Error: número de WhatsApp no configurado')
      return
    }

    const whatsappNumber = contact.whatsapp.replace(/\D/g, '')
    
    let message = `👋 *Nuevo mensaje de contacto - Keroro Store*\n\n`
    message += `*Nombre:* ${formData.name}\n`
    
    if (formData.email) {
      message += `*Email:* ${formData.email}\n`
    }
    
    if (formData.phone) {
      message += `*Teléfono:* ${formData.phone}\n`
    }
    
    message += `\n*Mensaje:*\n${formData.message}\n\n`
    message += `Gracias por contactarnos! Te responderemos a la brevedad. 🎉`

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
    
    toast.success('Mensaje preparado para WhatsApp')
    
    // Limpiar formulario
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    })
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-bg py-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface rounded w-64" />
            <div className="h-32 bg-surface rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-bg py-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface rounded w-64" />
            <div className="h-32 bg-surface rounded" />
          </div>
        </div>
      </div>
    )
  }

  const whatsappNumber = contact.whatsapp.replace(/\D/g, '')
  // URL de Google Maps para Yerbal 8, Caballito, Buenos Aires
  // Usando una URL de embed simple sin API key
  const mapUrl = (contact as any).mapUrl || `https://www.google.com/maps?q=Yerbal+8,+Caballito,+Buenos+Aires,+Argentina&output=embed`

  return (
    <div className="min-h-screen bg-bg py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-display font-bold text-text mb-12 text-center">
          Contacto
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Información de contacto */}
          <div className="bg-surface rounded-xl p-8 border border-primary-100">
            <h2 className="text-2xl font-display font-bold text-text mb-6">
              Estamos acá para ayudarte
            </h2>
            <p className="text-muted mb-8">
              Si tenés alguna consulta, no dudes en contactarnos. Estamos disponibles para ayudarte con lo que necesites.
            </p>

            <div className="space-y-6">
              {contact.whatsapp && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors group"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-text group-hover:text-primary transition-colors">
                      WhatsApp
                    </p>
                    <p className="text-muted">{contact.whatsapp}</p>
                  </div>
                </a>
              )}

              {contact.instagram && (
                <a
                  href={`https://instagram.com/${contact.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors group"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-text group-hover:text-primary transition-colors">
                      Instagram
                    </p>
                    <p className="text-muted">{contact.instagram}</p>
                  </div>
                </a>
              )}

              {contact.address && (
                <div className="flex items-start space-x-4 p-4 bg-primary-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-text mb-1">Dirección</p>
                    <p className="text-muted">{contact.address}</p>
                  </div>
                </div>
              )}

              {contact.hours && (
                <div className="flex items-start space-x-4 p-4 bg-primary-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-text mb-1">Horarios</p>
                    <p className="text-muted whitespace-pre-line">{contact.hours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="bg-surface rounded-xl p-8 border border-primary-100">
            <h2 className="text-2xl font-display font-bold text-text mb-6">
              Enviános un mensaje
            </h2>
            <p className="text-muted mb-6">
              Completá el formulario y te redirigiremos a WhatsApp con tu mensaje listo.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Mensaje *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Escribí tu consulta aquí..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Enviar por WhatsApp</span>
              </button>
            </form>
          </div>
        </div>

        {/* Medios de pago */}
        <div id="medios-pago" className="bg-surface rounded-xl p-8 border border-primary-100 mb-12 scroll-mt-24">
          <h2 className="text-2xl font-display font-bold text-text mb-6">
            Medios de pago
          </h2>
          <MediosDePago />
        </div>

        {/* Mapa */}
        {contact.address && (
          <div id="como-llegar" className="bg-surface rounded-xl p-8 border border-primary-100 mb-12 scroll-mt-24">
            <h2 className="text-2xl font-display font-bold text-text mb-6">
              🏠 Cómo llegar
            </h2>
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Keroro Store"
              />
            </div>
            <div className="mt-4 flex items-center space-x-2 text-muted">
              <MapPin className="w-5 h-5" />
              <p>{contact.address}</p>
            </div>
            {contact.hours && (
              <div className="mt-2 flex items-center space-x-2 text-muted">
                <Clock className="w-5 h-5" />
                <p>{contact.hours}</p>
              </div>
            )}
          </div>
        )}

        {/* FAQs */}
        <div id="faqs" className="bg-surface rounded-xl p-8 border border-primary-100 scroll-mt-24">
          <h2 className="text-3xl font-display font-bold text-text text-center mb-12">
            Preguntas frecuentes
          </h2>
          <ContactFAQs />
        </div>
      </div>
    </div>
  )
}

function MediosDePago() {
  const [payments, setPayments] = useState<PaymentMethod[]>([])

  useEffect(() => {
    async function loadPayments() {
      const { data } = await supabase
        .from('keroro_site_content')
        .select('data')
        .eq('id', 'payments')
        .single()
      
      if (data?.data?.methods) {
        setPayments(data.data.methods)
      }
    }
    loadPayments()
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {payments.map((payment, idx) => (
        <div
          key={idx}
          className="bg-bg rounded-xl p-4 border border-primary-100 text-center hover:shadow-soft transition-all"
        >
          <CreditCard className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="font-medium text-text">{payment.name}</p>
        </div>
      ))}
    </div>
  )
}

function ContactFAQs() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    async function loadFAQs() {
      const { data } = await supabase
        .from('keroro_site_content')
        .select('data')
        .eq('id', 'faqs')
        .single()
      
      if (data) {
        setFaqs(data.data || [])
      }
    }
    loadFAQs()
  }, [])

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq, idx) => (
        <div
          key={idx}
          className="border border-primary-100 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-bg transition-colors"
          >
            <span className="font-semibold text-text">{faq.question}</span>
            <span className="text-primary text-xl">
              {openIndex === idx ? '−' : '+'}
            </span>
          </button>
          {openIndex === idx && (
            <div className="px-6 py-4 bg-bg border-t border-primary-100">
              <p className="text-muted">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
