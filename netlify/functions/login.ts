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

    const { data: user, error } = await supabaseAdmin
      .from('keroro_users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Credenciales inválidas' }),
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
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Error del servidor' }),
    }
  }
}
