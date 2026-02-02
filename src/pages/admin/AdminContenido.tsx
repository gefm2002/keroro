import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { apiRequest } from '../../utils/api'
import { HeroContent, PromoBanner, PaymentMethod, FAQ, ContactData } from '../../types'
import { Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminContenido() {
  const [activeTab, setActiveTab] = useState<'hero' | 'promos' | 'payments' | 'faqs' | 'contact'>('hero')
  const [hero, setHero] = useState<HeroContent>({
    title: '',
    subtitle: '',
    cta: '',
    image: '',
  })
  const [promos, setPromos] = useState<PromoBanner[]>([])
  const [payments, setPayments] = useState<PaymentMethod[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [contact, setContact] = useState<ContactData>({
    whatsapp: '',
    instagram: '',
    address: '',
    hours: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadContent()
  }, [])

  async function loadContent() {
    try {
      const [heroData, promosData, paymentsData, faqsData, contactData] = await Promise.all([
        apiRequest<{ data: HeroContent }>('/admin-content?id=hero'),
        apiRequest<{ data: PromoBanner[] }>('/admin-content?id=promos'),
        apiRequest<{ data: { methods: PaymentMethod[] } }>('/admin-content?id=payments'),
        apiRequest<{ data: FAQ[] }>('/admin-content?id=faqs'),
        apiRequest<{ data: ContactData }>('/admin-content?id=contact'),
      ])

      if (heroData.data) setHero(heroData.data)
      if (promosData.data) setPromos(promosData.data)
      if (paymentsData.data?.methods) setPayments(paymentsData.data.methods)
      if (faqsData.data) setFaqs(faqsData.data)
      if (contactData.data) setContact(contactData.data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      switch (activeTab) {
        case 'hero':
          await apiRequest('/admin-content', {
            method: 'PUT',
            body: JSON.stringify({ id: 'hero', data: hero }),
          })
          break
        case 'promos':
          await apiRequest('/admin-content', {
            method: 'PUT',
            body: JSON.stringify({ id: 'promos', data: promos }),
          })
          break
        case 'payments':
          await apiRequest('/admin-content', {
            method: 'PUT',
            body: JSON.stringify({ id: 'payments', data: { methods: payments } }),
          })
          break
        case 'faqs':
          await apiRequest('/admin-content', {
            method: 'PUT',
            body: JSON.stringify({ id: 'faqs', data: faqs }),
          })
          break
        case 'contact':
          await apiRequest('/admin-content', {
            method: 'PUT',
            body: JSON.stringify({ id: 'contact', data: contact }),
          })
          break
      }
      toast.success('Contenido guardado')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted">Cargando...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-text">Contenido del sitio</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>Guardar cambios</span>
        </button>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-primary-100">
        {(['hero', 'promos', 'payments', 'faqs', 'contact'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted hover:text-text'
            }`}
          >
            {tab === 'hero' && 'Hero'}
            {tab === 'promos' && 'Promociones'}
            {tab === 'payments' && 'Pagos'}
            {tab === 'faqs' && 'FAQs'}
            {tab === 'contact' && 'Contacto'}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-primary-100 p-6">
        {activeTab === 'hero' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Título</label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Subtítulo</label>
              <input
                type="text"
                value={hero.subtitle}
                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Texto del CTA</label>
              <input
                type="text"
                value={hero.cta}
                onChange={(e) => setHero({ ...hero, cta: e.target.value })}
                className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">URL de imagen</label>
              <input
                type="text"
                value={hero.image}
                onChange={(e) => setHero({ ...hero, image: e.target.value })}
                className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {activeTab === 'promos' && (
          <div className="space-y-4">
            <button
              onClick={() => setPromos([...promos, { image: '', text: '', link: '', active: true, order: promos.length }])}
              className="flex items-center space-x-2 text-primary hover:text-primary-600"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar promo</span>
            </button>
            {promos.map((promo, idx) => (
              <div key={idx} className="border border-primary-100 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text">Promo {idx + 1}</h3>
                  <button
                    onClick={() => setPromos(promos.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Imagen URL</label>
                  <input
                    type="text"
                    value={promo.image}
                    onChange={(e) => {
                      const newPromos = [...promos]
                      newPromos[idx].image = e.target.value
                      setPromos(newPromos)
                    }}
                    className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Texto</label>
                  <input
                    type="text"
                    value={promo.text}
                    onChange={(e) => {
                      const newPromos = [...promos]
                      newPromos[idx].text = e.target.value
                      setPromos(newPromos)
                    }}
                    className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Link (opcional)</label>
                  <input
                    type="text"
                    value={promo.link || ''}
                    onChange={(e) => {
                      const newPromos = [...promos]
                      newPromos[idx].link = e.target.value
                      setPromos(newPromos)
                    }}
                    className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={promo.active}
                      onChange={(e) => {
                        const newPromos = [...promos]
                        newPromos[idx].active = e.target.checked
                        setPromos(newPromos)
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-text">Activa</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Orden</label>
                    <input
                      type="number"
                      value={promo.order}
                      onChange={(e) => {
                        const newPromos = [...promos]
                        newPromos[idx].order = parseInt(e.target.value)
                        setPromos(newPromos)
                      }}
                      className="w-24 px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <button
              onClick={() => setPayments([...payments, { name: '', icon: '' }])}
              className="flex items-center space-x-2 text-primary hover:text-primary-600"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar medio de pago</span>
            </button>
            {payments.map((payment, idx) => (
              <div key={idx} className="border border-primary-100 rounded-lg p-4 flex items-center space-x-4">
                <input
                  type="text"
                  value={payment.name}
                  onChange={(e) => {
                    const newPayments = [...payments]
                    newPayments[idx].name = e.target.value
                    setPayments(newPayments)
                  }}
                  placeholder="Nombre"
                  className="flex-1 px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={payment.icon}
                  onChange={(e) => {
                    const newPayments = [...payments]
                    newPayments[idx].icon = e.target.value
                    setPayments(newPayments)
                  }}
                  placeholder="Icono"
                  className="w-32 px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => setPayments(payments.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="space-y-4">
            <button
              onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
              className="flex items-center space-x-2 text-primary hover:text-primary-600"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar FAQ</span>
            </button>
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-primary-100 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text">FAQ {idx + 1}</h3>
                  <button
                    onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Pregunta</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const newFaqs = [...faqs]
                      newFaqs[idx].question = e.target.value
                      setFaqs(newFaqs)
                    }}
                    className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Respuesta</label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => {
                      const newFaqs = [...faqs]
                      newFaqs[idx].answer = e.target.value
                      setFaqs(newFaqs)
                    }}
                    rows={3}
                    className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">WhatsApp</label>
              <input
                type="text"
                value={contact.whatsapp}
                onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Instagram</label>
              <input
                type="text"
                value={contact.instagram}
                onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
                className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Dirección</label>
              <input
                type="text"
                value={contact.address}
                onChange={(e) => setContact({ ...contact, address: e.target.value })}
                className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Horarios</label>
              <textarea
                value={contact.hours}
                onChange={(e) => setContact({ ...contact, hours: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
