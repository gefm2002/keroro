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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método no permitido' }),
    }
  }

  try {
    const { base64, filename, productId } = JSON.parse(event.body || '{}')

    if (!base64 || !filename) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Base64 y filename requeridos' }),
      }
    }

    const buffer = Buffer.from(base64, 'base64')
    const fileExt = filename.split('.').pop()
    const filePath = `products/${productId || 'temp'}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('keroro_products')
      .upload(filePath, buffer, {
        contentType: `image/${fileExt}`,
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('keroro_products')
      .getPublicUrl(filePath)

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: publicUrl,
        storage_path: filePath,
      }),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Error al subir imagen' }),
    }
  }
}
