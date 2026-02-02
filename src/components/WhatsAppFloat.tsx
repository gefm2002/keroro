import { MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export default function WhatsAppFloat() {
  const [whatsapp, setWhatsapp] = useState('5491123989714')

  useEffect(() => {
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
  }, [])

  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition-all hover:scale-110"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  )
}
