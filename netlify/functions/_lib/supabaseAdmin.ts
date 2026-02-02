import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseAdminInstance: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Falta SUPABASE_URL. Configurá esta variable en Netlify > Site settings > Environment variables. Puede ser la misma que VITE_SUPABASE_URL.')
  }

  if (!supabaseServiceKey) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY. Esta es diferente de VITE_SUPABASE_ANON_KEY. Encontrála en Supabase > Settings > API > service_role (secret).')
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdminInstance
}

// Export para compatibilidad con código existente
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient]
  },
})
