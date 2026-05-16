import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin() {
  setError('')
  console.log('email:', email)
  console.log('password:', password)
  console.log('users in storage:', localStorage.getItem('inv_users'))
  
  const res = login(email, password)
  console.log('login result:', res)
  
  if (!res.ok) return setError(res.msg)
  navigate(res.role === 'admin' ? '/admin/scan' : '/user/request')
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-2">
          ระบบเบิก-ยืม-คืนอุปกรณ์
        </h1>
        <p className="text-center text-gray-400 text-sm mb-6">เข้าสู่ระบบ</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition"
          >
            เข้าสู่ระบบ
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500 space-y-1">
          <p className="font-medium text-gray-600">Demo Account:</p>
          <p>👑 Admin: admin@demo.com / admin1234</p>
          <p>👤 User: user@demo.com / user1234</p>
        </div>
      </div>
    </div>
  )
}