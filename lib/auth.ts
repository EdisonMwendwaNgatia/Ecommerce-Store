import { createClient } from './supabaseClient'

export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUp = async (email: string, password: string) => {
  const supabase = createClient()

  const { data: admins, error: adminError } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')

  const isFirstAdmin = admins?.length === 0

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error || !data.user) {
    return { data, error }
  }

  const role = isFirstAdmin ? 'admin' : 'customer'
  const { error: roleError } = await supabase
    .from('users')
    .update({ role })
    .eq('id', data.user.id)

  if (roleError) {
    return { data, error: roleError }
  }

  return { data, error }
}

export const signOut = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    throw error
  }
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase.auth.token')
    sessionStorage.clear()
  }
  
  return { error: null }
}

export const getCurrentUser = async () => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}

export const checkAdminRole = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) return false
  return data?.role === 'admin'
}

export const authOptions = {}