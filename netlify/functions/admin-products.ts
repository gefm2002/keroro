import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './_lib/supabaseAdmin'
import { requireAuth } from './_lib/auth'

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

  const method = event.httpMethod

  if (method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('keroro_products')
      .select(`
        *,
        category:keroro_categories(*),
        subcategory:keroro_subcategories(*),
        images:keroro_product_images(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  }

  if (method === 'POST') {
    const body = JSON.parse(event.body || '{}')
    const { images, ...productData } = body

    const { data: product, error: productError } = await supabaseAdmin
      .from('keroro_products')
      .insert(productData)
      .select()
      .single()

    if (productError) throw productError

    if (images && images.length > 0) {
      const imageRecords = images.map((img: any, index: number) => ({
        product_id: product.id,
        storage_path: img.storage_path,
        alt: img.alt || product.name,
        order_index: index,
      }))

      const { error: imagesError } = await supabaseAdmin
        .from('keroro_product_images')
        .insert(imageRecords)

      if (imagesError) throw imagesError
    }

    const { data: fullProduct } = await supabaseAdmin
      .from('keroro_products')
      .select(`
        *,
        category:keroro_categories(*),
        subcategory:keroro_subcategories(*),
        images:keroro_product_images(*)
      `)
      .eq('id', product.id)
      .single()

    return {
      statusCode: 201,
      body: JSON.stringify(fullProduct),
    }
  }

  if (method === 'PUT') {
    const body = JSON.parse(event.body || '{}')
    const { id, images, ...productData } = body

    const { error: updateError } = await supabaseAdmin
      .from('keroro_products')
      .update(productData)
      .eq('id', id)

    if (updateError) throw updateError

    if (images !== undefined) {
      await supabaseAdmin
        .from('keroro_product_images')
        .delete()
        .eq('product_id', id)

      if (images.length > 0) {
        const imageRecords = images.map((img: any, index: number) => ({
          product_id: id,
          storage_path: img.storage_path,
          alt: img.alt || body.name,
          order_index: index,
        }))

        const { error: imagesError } = await supabaseAdmin
          .from('keroro_product_images')
          .insert(imageRecords)

        if (imagesError) throw imagesError
      }
    }

    const { data: fullProduct } = await supabaseAdmin
      .from('keroro_products')
      .select(`
        *,
        category:keroro_categories(*),
        subcategory:keroro_subcategories(*),
        images:keroro_product_images(*)
      `)
      .eq('id', id)
      .single()

    return {
      statusCode: 200,
      body: JSON.stringify(fullProduct),
    }
  }

  if (method === 'DELETE') {
    const { id } = JSON.parse(event.body || '{}')

    const { error } = await supabaseAdmin
      .from('keroro_products')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Producto eliminado' }),
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'Método no permitido' }),
  }
}
