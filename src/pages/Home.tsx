import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { Product, Category, HeroContent, PromoBanner, PaymentMethod, FAQ } from '../types'
import ProductCard from '../components/ProductCard'
import { ArrowRight, ChevronRight } from 'lucide-react'

export default function Home() {
  const [hero, setHero] = useState<HeroContent | null>(null)
  const [promos, setPromos] = useState<PromoBanner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [payments, setPayments] = useState<PaymentMethod[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])

  useEffect(() => {
    async function loadData() {
      // Hero
      const { data: heroData } = await supabase
        .from('keroro_site_content')
        .select('data')
        .eq('id', 'hero')
        .single()
      if (heroData) setHero(heroData.data as HeroContent)

      // Promos
      const { data: promosData } = await supabase
        .from('keroro_site_content')
        .select('data')
        .eq('id', 'promos')
        .single()
      if (promosData) {
        const promosList = promosData.data as PromoBanner[]
        setPromos(promosList.filter(p => p.active).sort((a, b) => a.order - b.order))
      }

      // Categories
      const { data: catsData } = await supabase
        .from('keroro_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(6)
      if (catsData) setCategories(catsData)

      // New products
      const { data: newData } = await supabase
        .from('keroro_products')
        .select(`
          *,
          category:keroro_categories(*),
          subcategory:keroro_subcategories(*),
          images:keroro_product_images(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8)
      if (newData) setNewProducts(newData as Product[])

      // Featured products
      const { data: featData } = await supabase
        .from('keroro_products')
        .select(`
          *,
          category:keroro_categories(*),
          subcategory:keroro_subcategories(*),
          images:keroro_product_images(*)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(8)
      if (featData) setFeaturedProducts(featData as Product[])

      // Payments
      const { data: paymentsData } = await supabase
        .from('keroro_site_content')
        .select('data')
        .eq('id', 'payments')
        .single()
      if (paymentsData) setPayments(paymentsData.data.methods || [])

      // FAQs
      const { data: faqsData } = await supabase
        .from('keroro_site_content')
        .select('data')
        .eq('id', 'faqs')
        .single()
      if (faqsData) setFaqs(faqsData.data || [])
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-100 to-primary-50 py-20 md:py-32">
        <div className="absolute inset-0 wave-pattern opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-text mb-4">
              {hero?.title || 'Bienvenido a Keroro Store'}
            </h1>
            <p className="text-xl md:text-2xl text-muted mb-8">
              {hero?.subtitle || 'Tu tienda de Kpop, Manga, Anime y Coleccionables'}
            </p>
            <Link
              to="/productos"
              className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-lg"
            >
              <span>{hero?.cta || 'Ver productos'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Promos */}
      {promos.length > 0 && (
        <section className="py-8 bg-surface">
          <div className="container mx-auto px-4">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {promos.map((promo, idx) => (
                <a
                  key={idx}
                  href={promo.link || '#'}
                  className="flex-shrink-0 w-64 md:w-80 h-32 md:h-40 rounded-xl overflow-hidden relative group"
                >
                  <img
                    src={promo.image}
                    alt={promo.text}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <p className="text-white font-semibold">{promo.text}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-bg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display font-bold text-text">Categorías destacadas</h2>
              <Link
                to="/productos"
                className="text-primary hover:text-primary-600 font-medium flex items-center space-x-1"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/productos?category=${cat.slug}`}
                  className="bg-surface rounded-xl overflow-hidden hover:shadow-soft transition-all hover:-translate-y-1 group"
                >
                  <div className="aspect-square overflow-hidden bg-bg">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-text group-hover:text-primary transition-colors">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="py-16 bg-surface">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display font-bold text-text">Novedades</h2>
              <Link
                to="/productos?sort=newest"
                className="text-primary hover:text-primary-600 font-medium flex items-center space-x-1"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-bg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display font-bold text-text">Destacados</h2>
              <Link
                to="/productos?featured=true"
                className="text-primary hover:text-primary-600 font-medium flex items-center space-x-1"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Payments */}
      {payments.length > 0 && (
        <section className="py-16 bg-surface">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-text text-center mb-8">
              Medios de pago
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {payments.map((payment, idx) => (
                <div
                  key={idx}
                  className="bg-bg px-6 py-3 rounded-xl border border-primary-100 font-medium text-text"
                >
                  {payment.name}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="py-16 bg-bg">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-display font-bold text-text text-center mb-12">
              Preguntas frecuentes
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="bg-surface rounded-xl p-6 border border-primary-100"
                >
                  <summary className="font-semibold text-text cursor-pointer list-none">
                    {faq.question}
                  </summary>
                  <p className="mt-4 text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
