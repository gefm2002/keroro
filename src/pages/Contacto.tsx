import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { ContactData } from '../types'
import { MessageCircle, Instagram, MapPin, Clock } from 'lucide-react'

export default function Contacto() {
  const [contact, setContact] = useState<ContactData | null>(null)

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

  return (
    <div className="min-h-screen bg-bg py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-display font-bold text-text mb-12 text-center">
          Contacto
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
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
                <div className="flex items-center space-x-4 p-4 bg-primary-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">Dirección</p>
                    <p className="text-muted">{contact.address}</p>
                  </div>
                </div>
              )}

              {contact.hours && (
                <div className="flex items-center space-x-4 p-4 bg-primary-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">Horarios</p>
                    <p className="text-muted whitespace-pre-line">{contact.hours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-xl p-8 border border-primary-100">
            <h2 className="text-2xl font-display font-bold text-text mb-6">
              Envíanos un mensaje
            </h2>
            <p className="text-muted mb-6">
              La forma más rápida de contactarnos es por WhatsApp. Hacé clic en el botón de abajo y te responderemos a la brevedad.
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Abrir WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
