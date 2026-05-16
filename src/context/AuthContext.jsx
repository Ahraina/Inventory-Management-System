import { createContext, useContext, useState } from 'react'
import { findUser } from '../data/store'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('auth_user')
    return saved ? JSON.parse(saved) : null
  })

  function login(email, password) {
  const found = findUser(email.trim().toLowerCase(), password)
  if (!found) return { ok: false, msg: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
  const u = { id: found.id, email: found.email, name: found.name, role: found.role }
  setUser(u)
  sessionStorage.setItem('auth_user', JSON.stringify(u))
  return { ok: true, role: found.role }
}

  function logout() {
    setUser(null)
    sessionStorage.removeItem('auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)