import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './_lib/supabaseAdmin'
import { requireAuth } from './_lib/auth'
import Papa from 'papaparse'

export const handler: Handler = async (event) => {
  try {
    requireAuth(event)
  } catch (error: any) {
    console.error('Error de autenticación:', error)
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: error.message || 'No autorizado' }),
    }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método no permitido' }),
    }
  }

  try {
    const { data: products, error } = await supabaseAdmin
      .from('keroro_products')
      .select(`
        *,
        category:keroro_categories(slug),
        subcategory:keroro_subcategories(slug)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    const csvData = products.map((p: any) => ({
      product_id: p.id,
      slug: p.slug,
      name: p.name,
      category_slug: p.category?.slug || '',
      subcategory_slug: p.subcategory?.slug || '',
      price: p.price,
      offer_type: p.offer_type,
      offer_value: p.offer_value || '',
      is_out_of_stock: p.is_out_of_stock,
      is_featured: p.is_featured,
      is_active: p.is_active,
      short_desc: p.short_desc || '',
      long_desc: p.long_desc || '',
    }))

    const csv = Papa.unparse(csvData)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="inventario-keroro.csv"',
      },
      body: csv,
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Error al exportar' }),
    }
  }
}
