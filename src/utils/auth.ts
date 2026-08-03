'use client'

import { UserRole } from '@/types'

export async function signUp(email: string, password: string, role: UserRole) {
  const { supabase } = await import('@/lib/supabase')

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role },
    },
  })

  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { supabase } = await import('@/lib/supabase')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Backfill the user_roles row (database source of truth for user type)
  // for accounts that signed up before the table was enforced
  const signupRole = data.user?.user_metadata?.role
  if (data.user && (signupRole === 'performer' || signupRole === 'venue')) {
    const { ensureUserRole } = await import('@/utils/db')
    await ensureUserRole(data.user.id, signupRole).catch(() => {})
  }

  return data
}

export async function signOut() {
  const { supabase } = await import('@/lib/supabase')

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const { supabase } = await import('@/lib/supabase')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  if (error) throw error
}

export async function getSession() {
  const { supabase } = await import('@/lib/supabase')

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getCurrentUser() {
  const { supabase } = await import('@/lib/supabase')

  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.error('getCurrentUser error:', error)
    throw error
  }
  return data.user
}
