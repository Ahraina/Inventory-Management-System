import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const menuAdmin = [
  { path: '/admin/scan',     icon: '📷', label: 'สแกนบาร์โค้ด (Admin)' },
  { path: '/admin/inventory',icon: '📦', label: 'สต็อกคงเหลือ' },
  { path: '/admin/requests', icon: '🗂️', label: 'คำขอเบิก (เจ้าหน้าที่)' },
  { path: '/admin/returns',  icon: '↩️', label: 'คำขอคืน (เจ้าหน้าที่)' },
]

const menuUser = [
  { path: '/user/inventory',   icon: '📦', label: 'สต็อกคงเหลือ' },
  { path: '/user/request',     icon: '📝', label: 'ขอเบิกอุปกรณ์' },
  { path: '/user/my-requests', icon: '📮', label: 'สถานะคำขอของฉัน' },
  { path: '/user/returns',     icon: '↩️', label: 'คืนของเบิก' },
]

const menuOther = [
  { path: '/settings', icon: '⚙️', label: 'ตั้งค่าระบบ' },
  { path: '/profile',  icon: '👤', label: 'โปรไฟล์ของฉัน' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isAdmin = user?.role === 'admin'
  const mainMenu = isAdmin ? menuAdmin : menuUser

  function handleLogout() {
    logout()
    navigate('/')
  }

  function NavItem({ item }) {
    const active = location.pathname === item.path
    return (
      <button
        onClick={() => navigate(item.path)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition
          ${active
            ? 'bg-indigo-600 text-white'
            : 'hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
      >
        <span>{item.icon}</span>
        <span className="text-sm">{item.label}</span>
      </button>
    )
  }

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="text-lg font-semibold">🧰 ระบบเบิกของ</div>
        <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
          เข้าสู่ระบบ: {user?.email}{' '}
          <span className="text-indigo-600">[{user?.role}]</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3 space-y-1 flex-1">
        {mainMenu.map(item => (
          <NavItem key={item.path} item={item} />
        ))}

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 text-[11px] uppercase tracking-wide text-gray-400">
          อื่น ๆ
        </div>

        {menuOther.map(item => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition"
        >
          🚪 <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  )
}