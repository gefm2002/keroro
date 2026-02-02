import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { Product } from '../types'
import { formatPrice, calculateFinalPrice } from '../utils/format'
import { addToCart } from '../utils/cart'
import { getImageUrl } from '../utils/images'
import toast from 'react-hot-toast'
import { ChevronLeft, Plus, Minus, ShoppingCart } from 'lucide-react'

export default function ProductoDetalle() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return

      const { data, error } = await supabase
        .from('keroro_products')
        .select(`
          *,
          category:keroro_categories(*),
          subcategory:keroro_subcategories(*),
          images:keroro_product_images(*)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        navigate('/productos')
        return
      }

      setProduct(data as Product)
      setLoading(false)
    }
    loadProduct()
  }, [slug, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-surface rounded-xl" />
            <div className="h-64 bg-surface rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const finalPrice = calculateFinalPrice(
    product.price,
    product.offer_type,
    product.offer_value
  )
  const hasOffer = product.offer_type !== 'none' && finalPrice < product.price
  const images = product.images || []
  const mainImage = getImageUrl(images[selectedImageIndex]?.storage_path)

  const handleAddToCart = () => {
    if (product.is_out_of_stock) {
      toast.error('Este producto no tiene stock')
      return
    }
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        finalPrice,
        image: getImageUrl(images[0]?.storage_path),
      })
    }
    toast.success(`Agregado${quantity > 1 ? 's' : ''} al carrito`)
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-muted hover:text-text mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-surface rounded-xl overflow-hidden mb-4">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-primary'
                        : 'border-primary-200 hover:border-primary-300'
                    }`}
                  >
                    <img
                      src={getImageUrl(img.storage_path)}
                      alt={img.alt || product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {hasOffer && (
                <span className="bg-accent text-white px-3 py-1 rounded-lg text-sm font-bold">
                  OFERTA
                </span>
              )}
              {product.is_out_of_stock && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                  SIN STOCK
                </span>
              )}
              {product.is_featured && (
                <span className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-bold">
                  DESTACADO
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold text-text mb-4">
              {product.name}
            </h1>

            {product.category && (
              <div className="mb-4">
                <span className="text-muted">Categoría: </span>
                <span className="text-text font-medium">{product.category.name}</span>
                {product.subcategory && (
                  <>
                    <span className="text-muted mx-2">•</span>
                    <span className="text-text font-medium">{product.subcategory.name}</span>
                  </>
                )}
              </div>
            )}

            <div className="mb-6">
              {hasOffer ? (
                <div>
                  <span className="text-muted line-through text-xl">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-primary font-bold text-3xl ml-3">
                    {formatPrice(finalPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-primary font-bold text-3xl">
                  {formatPrice(finalPrice)}
                </span>
              )}
            </div>

            {product.short_desc && (
              <p className="text-lg text-muted mb-6">{product.short_desc}</p>
            )}

            {product.long_desc && (
              <div className="mb-6">
                <h2 className="font-semibold text-text mb-2">Descripción</h2>
                <p className="text-muted whitespace-pre-line">{product.long_desc}</p>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-text">Cantidad:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg bg-primary-100 text-primary hover:bg-primary-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg bg-primary-100 text-primary hover:bg-primary-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.is_out_of_stock}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:bg-muted disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{product.is_out_of_stock ? 'Sin stock' : 'Agregar al carrito'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
