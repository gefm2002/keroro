import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { Product } from '../types'
import { formatPrice, calculateFinalPrice } from '../utils/format'
import { addToCart } from '../utils/cart'
import { getImageUrl } from '../utils/images'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const finalPrice = calculateFinalPrice(
    product.price,
    product.offer_type,
    product.offer_value
  )
  const hasOffer = product.offer_type !== 'none' && finalPrice < product.price
  const mainImage = getImageUrl(product.images?.[0]?.storage_path)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (product.is_out_of_stock) {
      toast.error('Este producto no tiene stock')
      return
    }
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      finalPrice,
      image: mainImage,
    })
    toast.success('Agregado al carrito')
  }

  return (
    <Link
      to={`/productos/${product.slug}`}
      className="group block bg-surface rounded-xl overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-bg">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasOffer && (
          <div className="absolute top-2 left-2 bg-accent text-white px-2 py-1 rounded-lg text-xs font-bold">
            OFERTA
          </div>
        )}
        {product.is_out_of_stock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
            SIN STOCK
          </div>
        )}
        {product.is_featured && (
          <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            DESTACADO
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <div>
            {hasOffer ? (
              <div>
                <span className="text-muted line-through text-sm">
                  {formatPrice(product.price)}
                </span>
                <span className="text-primary font-bold text-lg ml-2">
                  {formatPrice(finalPrice)}
                </span>
              </div>
            ) : (
              <span className="text-primary font-bold text-lg">
                {formatPrice(finalPrice)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.is_out_of_stock}
          className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:bg-muted disabled:cursor-not-allowed"
        >
          {product.is_out_of_stock ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </Link>
  )
}
