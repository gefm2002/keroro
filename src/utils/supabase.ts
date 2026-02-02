import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase - funciona en cliente y servidor
function getSupabaseUrl() {
  if (typeof window !== 'undefined') {
    // Cliente (browser) - solo usar import.meta.env
    return import.meta.env?.VITE_SUPABASE_URL || 'https://sfcxgbwrmwtvalllzhqv.supabase.co'
  }
  // Servidor (Node.js)
  return (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 'https://sfcxgbwrmwtvalllzhqv.supabase.co'
}

function getSupabaseKey() {
  if (typeof window !== 'undefined') {
    // Cliente (browser) - solo usar import.meta.env
    return import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmY3hnYndybXd0dmFsbGx6aHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNDM3MDEsImV4cCI6MjA3NjkxOTcwMX0.I9xwt9di3X6C7AP37W6Php-DDSqJ1MIILHrhZfGNesQ'
  }
  // Servidor (Node.js)
  return (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmY3hnYndybXd0dmFsbGx6aHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNDM3MDEsImV4cCI6MjA3NjkxOTcwMX0.I9xwt9di3X6C7AP37W6Php-DDSqJ1MIILHrhZfGNesQ'
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseKey()

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No usar auth de Supabase, manejamos nosotros
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
