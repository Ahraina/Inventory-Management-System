import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers } from '../data/store'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [status, setStatus] = useState({ msg: '', ok: true })

  function handleRegister() {
    setStatus({ msg: '', ok: true })
    const { name, email, password } = form
    if (!email || !password) return setStatus({ msg: 'กรอกอีเมลและรหัสผ่าน', ok: false })

    const users = getUsers()
    if (users.find(u => u.email === email)) {
      return setStatus({ msg: 'อีเมลนี้มีผู้ใช้อยู่แล้ว', ok: false })
    }

    // เพิ่ม user ใหม่
    users.push({
      id: crypto.randomUUID(),
      email: email.trim().toLowerCase(),
      password,
      name: name.trim() || email,
      role: 'user'
    })
    localStorage.setItem('inv_users', JSON.stringify(users))
    setStatus({ msg: 'สมัครเสร็จแล้ว! โปรดเข้าสู่ระบบ', ok: true })
    setTimeout(() => navigate('/'), 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          สมัครสมาชิก
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ชื่อ</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="ชื่อของคุณ"
              className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">อีเมล</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {status.msg && (
            <p className={`text-sm ${status.ok ? 'text-emerald-600' : 'text-red-500'}`}>
              {status.msg}
            </p>
          )}

          <button
            onClick={handleRegister}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition"
          >
            สมัครสมาชิก
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-6">
          มีบัญชีแล้ว?{' '}
          <button onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700 font-medium">
            ไปหน้า Login
          </button>
        </p>
      </div>
    </div>
  )
}