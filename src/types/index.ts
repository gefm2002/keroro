export interface Category {
  id: string
  name: string
  slug: string
  image?: string | null
  order_index: number
  is_active: boolean
  created_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  order_index: number
  is_active: boolean
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  storage_path: string
  alt: string
  order_index: number
  created_at: string
}

export interface Product {
  id: string
  category_id: string
  subcategory_id: string | null
  name: string
  slug: string
  short_desc: string | null
  long_desc: string | null
  price: number
  offer_type: 'none' | 'percent' | 'fixed' | 'final'
  offer_value: number | null
  is_out_of_stock: boolean
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
  subcategory?: Subcategory
  images?: ProductImage[]
}

export interface SiteContent {
  id: string
  data: any
  updated_at: string
}

export interface HeroContent {
  title: string
  subtitle: string
  cta: string
  image: string
}

export interface PromoBanner {
  id?: string
  image: string
  link?: string
  text: string
  active: boolean
  order: number
}

export interface PaymentMethod {
  name: string
  icon: string
}

export interface BankPromo {
  day: string
  reintegro: string
  tope: string
  condiciones: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface ContactData {
  whatsapp: string
  instagram: string
  address: string
  hours: string
}
