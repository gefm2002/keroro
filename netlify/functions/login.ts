import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './_lib/supabaseAdmin'
import { comparePassword, signToken } from './_lib/auth'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método no permitido' }),
    }
  }

  try {
    const { email, password } = JSON.parse(event.body || '{}')

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email y contraseña requeridos' }),
      }
    }

    // Verificar variables de entorno
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error de configuración del servidor' }),
      }
    }

    const { data: user, error } = await supabaseAdmin
      .from('keroro_users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error al buscar usuario:', error)
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Credenciales inválidas', debug: error.message }),
      }
    }

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Credenciales inválidas' }),
      }
    }

    if (!user.password_hash) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error: usuario sin contraseña configurada' }),
      }
    }

    const isValid = await comparePassword(password, user.password_hash)
    if (!isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Credenciales inválidas' }),
      }
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ token, user: { id: user.id, email: user.email, role: user.role } }),
    }
  } catch (error: any) {
    console.error('Error en login:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Error del servidor', debug: error.stack }),
    }
  }
}
