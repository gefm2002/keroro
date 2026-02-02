import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './_lib/supabaseAdmin'
import { requireAuth } from './_lib/auth'

export const handler: Handler = async (event) => {
  try {
    requireAuth(event as any)
  } catch {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'No autorizado' }),
    }
  }

  const method = event.httpMethod

  if (method === 'GET') {
    const { category_id } = event.queryStringParameters || {}
    
    let query = supabaseAdmin
      .from('keroro_subcategories')
      .select('*')
      .order('order_index', { ascending: true })

    if (category_id) {
      query = query.eq('category_id', category_id)
    }

    const { data, error } = await query

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  }

  if (method === 'POST') {
    const body = JSON.parse(event.body || '{}')
    const { data, error } = await supabaseAdmin
      .from('keroro_subcategories')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return {
      statusCode: 201,
      body: JSON.stringify(data),
    }
  }

  if (method === 'PUT') {
    const body = JSON.parse(event.body || '{}')
    const { id, ...updateData } = body

    const { data, error } = await supabaseAdmin
      .from('keroro_subcategories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  }

  if (method === 'DELETE') {
    const { id } = JSON.parse(event.body || '{}')

    const { error } = await supabaseAdmin
      .from('keroro_subcategories')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Subcategoría eliminada' }),
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'Método no permitido' }),
  }
}
