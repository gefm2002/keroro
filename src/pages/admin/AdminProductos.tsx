import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { apiRequest } from '../../utils/api'
import { Product, Category, Subcategory } from '../../types'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminProductos() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<any>({
    name: '',
    slug: '',
    category_id: '',
    subcategory_id: '',
    short_desc: '',
    long_desc: '',
    price: '',
    offer_type: 'none',
    offer_value: '',
    is_out_of_stock: false,
    is_featured: false,
    is_active: true,
    images: [],
  })

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  async function loadProducts() {
    try {
      const data = await apiRequest<Product[]>('/admin-products')
      setProducts(data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      const data = await apiRequest<Category[]>('/admin-categories')
      setCategories(data)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function loadSubcategories(categoryId: string) {
    try {
      const data = await apiRequest<Subcategory[]>(`/admin-subcategories?category_id=${categoryId}`)
      setSubcategories(data)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await apiRequest(`/admin-products`, {
          method: 'PUT',
          body: JSON.stringify({ id: editingProduct.id, ...formData }),
        })
        toast.success('Producto actualizado')
      } else {
        await apiRequest(`/admin-products`, {
          method: 'POST',
          body: JSON.stringify(formData),
        })
        toast.success('Producto creado')
      }
      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      loadProducts()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      await apiRequest(`/admin-products`, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })
      toast.success('Producto eliminado')
      loadProducts()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      category_id: product.category_id,
      subcategory_id: product.subcategory_id || '',
      short_desc: product.short_desc || '',
      long_desc: product.long_desc || '',
      price: product.price,
      offer_type: product.offer_type,
      offer_value: product.offer_value || '',
      is_out_of_stock: product.is_out_of_stock,
      is_featured: product.is_featured,
      is_active: product.is_active,
      images: product.images || [],
    })
    if (product.category_id) {
      loadSubcategories(product.category_id)
    }
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      category_id: '',
      subcategory_id: '',
      short_desc: '',
      long_desc: '',
      price: '',
      offer_type: 'none',
      offer_value: '',
      is_out_of_stock: false,
      is_featured: false,
      is_active: true,
      images: [],
    })
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-text">Productos</h1>
        <button
          onClick={() => {
            resetForm()
            setEditingProduct(null)
            setShowModal(true)
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo producto</span>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Precio</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Estado</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-text">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-bg transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-text">{product.name}</div>
                    <div className="text-sm text-muted">{product.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-text">${product.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {!product.is_active && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Inactivo</span>
                      )}
                      {product.is_out_of_stock && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Sin stock</span>
                      )}
                      {product.is_featured && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">Destacado</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
        <ProductModal
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          subcategories={subcategories}
          loadSubcategories={loadSubcategories}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false)
            setEditingProduct(null)
            resetForm()
          }}
          editingProduct={editingProduct}
        />
      )}
    </AdminLayout>
  )
}

function ProductModal({
  formData,
  setFormData,
  categories,
  subcategories,
  loadSubcategories,
  onSubmit,
  onClose,
  editingProduct,
}: any) {
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (formData.images.length >= 5) {
      toast.error('Máximo 5 imágenes por producto')
      return
    }

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1]
        const { storage_path } = await apiRequest<{ url: string; storage_path: string }>(
          '/upload-image',
          {
            method: 'POST',
            body: JSON.stringify({
              base64,
              filename: file.name,
              productId: editingProduct?.id || 'temp',
            }),
          }
        )
        setFormData({
          ...formData,
          images: [...formData.images, { storage_path, alt: formData.name }],
        })
        toast.success('Imagen subida')
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-primary-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-text">
            {editingProduct ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
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
              <label className="block text-sm font-medium text-text mb-2">Categoría *</label>
              <select
                value={formData.category_id}
                onChange={(e) => {
                  setFormData({ ...formData, category_id: e.target.value, subcategory_id: '' })
                  if (e.target.value) loadSubcategories(e.target.value)
                }}
                required
                className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccionar...</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Subcategoría</label>
              <select
                value={formData.subcategory_id}
                onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Ninguna</option>
                {subcategories.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Precio *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Tipo de oferta</label>
              <select
                value={formData.offer_type}
                onChange={(e) => setFormData({ ...formData, offer_type: e.target.value })}
                className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="none">Sin oferta</option>
                <option value="percent">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
                <option value="final">Precio final</option>
              </select>
            </div>

            {formData.offer_type !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">Valor de oferta</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.offer_value}
                  onChange={(e) => setFormData({ ...formData, offer_value: e.target.value })}
                  className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Descripción corta</label>
            <textarea
              value={formData.short_desc}
              onChange={(e) => setFormData({ ...formData, short_desc: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Descripción larga</label>
            <textarea
              value={formData.long_desc}
              onChange={(e) => setFormData({ ...formData, long_desc: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-bg border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Imágenes ({formData.images.length}/5)</label>
            <div className="grid grid-cols-5 gap-4 mb-4">
              {formData.images.map((img: any, idx: number) => (
                <div key={idx} className="relative aspect-square bg-bg rounded-lg overflow-hidden">
                  <img src={img.storage_path} alt={img.alt} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        images: formData.images.filter((_: any, i: number) => i !== idx),
                      })
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {formData.images.length < 5 && (
                <label className="aspect-square bg-bg border-2 border-dashed border-primary-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? 'Subiendo...' : '+'}
                </label>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-text">Activo</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-text">Destacado</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_out_of_stock}
                onChange={(e) => setFormData({ ...formData, is_out_of_stock: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-text">Sin stock</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-primary-200 rounded-lg text-text hover:bg-bg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {editingProduct ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
