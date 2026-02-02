import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Package, Folder, FileText, Database, Layout } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Layout },
    { path: '/admin/productos', label: 'Productos', icon: Package },
    { path: '/admin/categorias', label: 'Categorías', icon: Folder },
    { path: '/admin/contenido', label: 'Contenido', icon: FileText },
    { path: '/admin/inventario', label: 'Inventario', icon: Database },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex">
        <aside className="w-64 bg-surface border-r border-primary-100 min-h-screen sticky top-0">
          <div className="p-6 border-b border-primary-100">
            <h1 className="text-xl font-display font-bold text-text">Keroro Admin</h1>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text hover:bg-primary-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-primary-100">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
