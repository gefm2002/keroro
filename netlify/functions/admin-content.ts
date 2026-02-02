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
    const { id } = event.queryStringParameters || {}
    
    if (id) {
      const { data, error } = await supabaseAdmin
        .from('keroro_site_content')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        statusCode: 200,
        body: JSON.stringify(data),
      }
    }

    const { data, error } = await supabaseAdmin
      .from('keroro_site_content')
      .select('*')

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  }

  if (method === 'PUT') {
    const body = JSON.parse(event.body || '{}')
    const { id, data: contentData } = body

    const { data, error } = await supabaseAdmin
      .from('keroro_site_content')
      .upsert({
        id,
        data: contentData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'Método no permitido' }),
  }
}
