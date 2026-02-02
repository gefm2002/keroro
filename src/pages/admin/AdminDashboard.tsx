import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../utils/supabase'
import { Package, Folder, ShoppingCart, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    activeProducts: 0,
    featuredProducts: 0,
  })

  useEffect(() => {
    async function loadStats() {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('keroro_products').select('id, is_active, is_featured', { count: 'exact' }),
        supabase.from('keroro_categories').select('id', { count: 'exact' }),
      ])

      const products = productsRes.data || []
      setStats({
        products: products.length,
        categories: categoriesRes.count || 0,
        activeProducts: products.filter((p: any) => p.is_active).length,
        featuredProducts: products.filter((p: any) => p.is_featured).length,
      })
    }
    loadStats()
  }, [])

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-display font-bold text-text mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-xl p-6 border border-primary-100">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-text">{stats.products}</h3>
            <p className="text-muted">Total productos</p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-primary-100">
            <div className="flex items-center justify-between mb-4">
              <Folder className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-text">{stats.categories}</h3>
            <p className="text-muted">Categorías</p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-primary-100">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-text">{stats.activeProducts}</h3>
            <p className="text-muted">Productos activos</p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-primary-100">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-text">{stats.featuredProducts}</h3>
            <p className="text-muted">Productos destacados</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
