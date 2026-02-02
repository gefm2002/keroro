import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { apiRequest } from '../../utils/api'
import { Category } from '../../types'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCategorias() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    order_index: 0,
    is_active: true,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const data = await apiRequest<Category[]>('/admin-categories')
      setCategories(data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await apiRequest(`/admin-categories`, {
          method: 'PUT',
          body: JSON.stringify({ id: editingCategory.id, ...formData }),
        })
        toast.success('Categoría actualizada')
      } else {
        await apiRequest(`/admin-categories`, {
          method: 'POST',
          body: JSON.stringify(formData),
        })
        toast.success('Categoría creada')
      }
      setShowModal(false)
      setEditingCategory(null)
      resetForm()
      loadCategories()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
    try {
      await apiRequest(`/admin-categories`, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })
      toast.success('Categoría eliminada')
      loadCategories()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      image: category.image || '',
      order_index: category.order_index,
      is_active: category.is_active,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      image: '',
      order_index: 0,
      is_active: true,
    })
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-text">Categorías</h1>
        <button
          onClick={() => {
            resetForm()
            setEditingCategory(null)
            setShowModal(true)
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva categoría</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted">Cargando...</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-primary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Imagen</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Orden</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Estado</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-text">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-bg transition-colors">
                  <td className="px-6 py-4">
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 bg-bg rounded-lg flex items-center justify-center text-muted text-xs">Sin imagen</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-text">{category.name}</td>
                  <td className="px-6 py-4 text-muted">{category.slug}</td>
                  <td className="px-6 py-4 text-text">{category.order_index}</td>
                  <td className="px-6 py-4">
                    {category.is_active ? (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">Activa</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Inactiva</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4" style={{ opacity: 1 }}>
          <div className="bg-surface rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-primary-100 flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-text">
                {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingCategory(null)
                  resetForm()
                }}
                className="p-2 hover:bg-bg rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
                    })
                  }}
                  required
                  className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">URL de imagen</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/category-..."
                  className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img src={formData.image} alt="Preview" className="w-32 h-24 object-cover rounded-lg border border-primary-200" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Orden</label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-text">Activa</span>
              </label>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
                    resetForm()
                  }}
                  className="px-6 py-2 border border-primary-200 rounded-lg text-text hover:bg-bg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  {editingCategory ? 'Guardar cambios' : 'Crear categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
