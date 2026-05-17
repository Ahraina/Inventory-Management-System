import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    try {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user

      if (!sessionUser) {
        setUser(null)
        return
      }

      const profile = await getProfile(sessionUser.id)

      setUser({
        id: sessionUser.id,
        email: sessionUser.email,
        name: profile?.full_name || profile?.name || sessionUser.email,
        role: profile?.role || 'user'
      })
    } catch (error) {
      console.log(error.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)

  if (error) {
    console.log('get profile error:', error.message)
    return null
  }

  return data?.[0] || null
}

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    })

    if (error) {
      return { ok: false, msg: error.message }
    }

    const profile = await getProfile(data.user.id)

    console.log('LOGIN USER ID:', data.user.id)
    console.log('LOGIN EMAIL:', data.user.email)
    console.log('PROFILE FROM DB:', profile)

    const u = {
      id: data.user.id,
      email: data.user.email,
      name: profile?.full_name || profile?.name || data.user.email,
      role: profile?.role || 'user'
    }

    setUser(u)

    return { ok: true, role: u.role }
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)