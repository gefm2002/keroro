const API_BASE = (import.meta as any).env?.DEV ? 'http://localhost:8888/.netlify/functions' : '/.netlify/functions'

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('admin_token')
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }))
    throw new Error(error.message || `Error ${response.status}`)
  }

  return response.json()
}
