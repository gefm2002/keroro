import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Menu, X, MessageCircle } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { supabase } from '../utils/supabase'
import { useCartStore } from '../store/cartStore'

export default function HeaderSticky() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const { itemCount } = useCart()
  const { openCart } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('keroro_categories')
        .select(`
          *,
          subcategories:keroro_subcategories(*)
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true })
      
      if (data) setCategories(data)
    }
    loadCategories()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/productos?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-soft transition-all duration-300"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/images/logo.png"
                alt="Keroro Store"
                className="h-10 md:h-12 w-auto"
              />
              <span className="font-display font-bold text-lg md:text-xl text-text hidden sm:block">
                Keroro Store
              </span>
            </Link>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2 bg-bg border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </form>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-6">
              <div
                className="relative"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <button className="text-text hover:text-primary font-medium transition-colors">
                  Productos
                </button>
                {isMegaMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-[600px] bg-surface rounded-xl shadow-soft border border-primary-100 p-6 z-50">
                    <div className="grid grid-cols-3 gap-6">
                      {categories.map((cat) => (
                        <div key={cat.id}>
                          <Link
                            to={`/productos?category=${cat.slug}`}
                            className="font-semibold text-text hover:text-primary mb-2 block"
                            onClick={() => setIsMegaMenuOpen(false)}
                          >
                            {cat.name}
                          </Link>
                          <div className="space-y-1">
                            {cat.subcategories?.slice(0, 5).map((sub: any) => (
                              <Link
                                key={sub.id}
                                to={`/productos?category=${cat.slug}&subcategory=${sub.slug}`}
                                className="block text-sm text-muted hover:text-primary transition-colors"
                                onClick={() => setIsMegaMenuOpen(false)}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link to="/contacto#medios-pago" className="text-text hover:text-primary font-medium transition-colors">
                Medios de pago
              </Link>
              <Link to="/contacto#faqs" className="text-text hover:text-primary font-medium transition-colors">
                FAQs
              </Link>
              <Link to="/contacto#como-llegar" className="text-text hover:text-primary font-medium transition-colors">
                Cómo llegar
              </Link>
              <Link to="/contacto" className="text-text hover:text-primary font-medium transition-colors">
                Contacto
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search */}
              <button
                onClick={() => navigate('/productos')}
                className="md:hidden p-2 text-text hover:text-primary transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 text-text hover:text-primary transition-colors"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* WhatsApp */}
              <a
                href="https://wa.me/5491123989714"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">WhatsApp</span>
              </a>

              {/* Mobile Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-text hover:text-primary transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-primary-100 bg-surface">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                to="/productos"
                className="block font-semibold text-text hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Productos
              </Link>
              <Link
                to="/contacto#medios-pago"
                className="block font-semibold text-text hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Medios de pago
              </Link>
              <Link
                to="/contacto#faqs"
                className="block font-semibold text-text hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQs
              </Link>
              <Link
                to="/contacto#como-llegar"
                className="block font-semibold text-text hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Cómo llegar
              </Link>
              <Link
                to="/contacto"
                className="block font-semibold text-text hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              <a
                href="https://wa.me/5491123989714"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>
      <div className="h-16 md:h-20" />
    </>
  )
}
