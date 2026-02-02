import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { Product, Category, Subcategory } from '../types'
import ProductCard from '../components/ProductCard'
import { Filter, X } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

export default function Productos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const { openCart } = useCartStore()

  const categoryFilter = searchParams.get('category')
  const subcategoryFilter = searchParams.get('subcategory')
  const searchQuery = searchParams.get('q')
  const sortBy = searchParams.get('sort') || 'newest'
  const featuredFilter = searchParams.get('featured') === 'true'

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('keroro_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
      if (data) setCategories(data)
    }
    loadCategories()
  }, [])

  useEffect(() => {
    async function loadSubcategories() {
      if (!categoryFilter) {
        setSubcategories([])
        return
      }
      const { data: catData } = await supabase
        .from('keroro_categories')
        .select('id')
        .eq('slug', categoryFilter)
        .single()
      
      if (catData) {
        const { data } = await supabase
          .from('keroro_subcategories')
          .select('*')
          .eq('category_id', catData.id)
          .eq('is_active', true)
          .order('order_index', { ascending: true })
        if (data) setSubcategories(data)
      }
    }
    loadSubcategories()
  }, [categoryFilter])

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      let query = supabase
        .from('keroro_products')
        .select(`
          *,
          category:keroro_categories(*),
          subcategory:keroro_subcategories(*),
          images:keroro_product_images(*)
        `)
        .eq('is_active', true)

      if (categoryFilter) {
        const { data: catData } = await supabase
          .from('keroro_categories')
          .select('id')
          .eq('slug', categoryFilter)
          .single()
        if (catData) {
          query = query.eq('category_id', catData.id)
        }
      }

      if (subcategoryFilter) {
        const { data: subData } = await supabase
          .from('keroro_subcategories')
          .select('id')
          .eq('slug', subcategoryFilter)
          .single()
        if (subData) {
          query = query.eq('subcategory_id', subData.id)
        }
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
      }

      if (featuredFilter) {
        query = query.eq('is_featured', true)
      }

      // Sort
      switch (sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true })
          break
        case 'price-desc':
          query = query.order('price', { ascending: false })
          break
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      const { data, error } = await query

      if (error) {
        console.error(error)
      } else if (data) {
        setProducts(data as Product[])
      }
      setLoading(false)
    }
    loadProducts()
  }, [categoryFilter, subcategoryFilter, searchQuery, sortBy, featuredFilter])

  const handleFilterChange = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`md:sticky md:top-24 md:h-fit md:w-64 ${isFiltersOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-surface rounded-xl p-6 border border-primary-100">
              <div className="flex items-center justify-between mb-6 md:hidden">
                <h2 className="text-xl font-display font-bold text-text">Filtros</h2>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="p-2 text-muted hover:text-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-semibold text-text mb-3">Categoría</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleFilterChange('category', null)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        !categoryFilter
                          ? 'bg-primary text-white'
                          : 'bg-bg text-text hover:bg-primary-50'
                      }`}
                    >
                      Todas
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleFilterChange('category', cat.slug)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          categoryFilter === cat.slug
                            ? 'bg-primary text-white'
                            : 'bg-bg text-text hover:bg-primary-50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategory Filter */}
                {subcategories.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-text mb-3">Subcategoría</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleFilterChange('subcategory', null)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          !subcategoryFilter
                            ? 'bg-primary text-white'
                            : 'bg-bg text-text hover:bg-primary-50'
                        }`}
                      >
                        Todas
                      </button>
                      {subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleFilterChange('subcategory', sub.slug)}
                          className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            subcategoryFilter === sub.slug
                              ? 'bg-primary text-white'
                              : 'bg-bg text-text hover:bg-primary-50'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sort */}
                <div>
                  <h3 className="font-semibold text-text mb-3">Ordenar</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full px-3 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="newest">Más nuevos</option>
                    <option value="price-asc">Precio: menor a mayor</option>
                    <option value="price-desc">Precio: mayor a menor</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-display font-bold text-text">
                {searchQuery ? `Búsqueda: "${searchQuery}"` : 'Productos'}
              </h1>
              <button
                onClick={() => setIsFiltersOpen(true)}
                className="md:hidden flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl"
              >
                <Filter className="w-5 h-5" />
                <span>Filtros</span>
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-surface rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted text-lg">No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
