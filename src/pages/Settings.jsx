import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { supabase } from '../utils/supabase'


export default function Settings() {
  const { user } = useAuth()
  const [pwOld, setPwOld] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwNew2, setPwNew2] = useState('')
  const [pwStatus, setPwStatus] = useState({ msg: '', ok: true })
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')
  const [notify, setNotify] = useState(localStorage.getItem('notify') === 'true')
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'th')
  const [tz, setTz] = useState(localStorage.getItem('tz') || 'Asia/Bangkok')
  const [generalStatus, setGeneralStatus] = useState('')
  const [wipeConfirm, setWipeConfirm] = useState(false)
  const [wipeStatus, setWipeStatus] = useState({ msg: '', ok: true })

  function applyTheme(isDark) {
    setDark(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark)
  }

  async function handleChangePw() {
  if (!pwOld || !pwNew || !pwNew2) {
    return setPwStatus({ msg: 'กรอกให้ครบ', ok: false })
  }

  if (pwNew !== pwNew2) {
    return setPwStatus({ msg: 'รหัสใหม่ไม่ตรงกัน', ok: false })
  }

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: pwOld
  })

  if (loginError) {
    return setPwStatus({
      msg: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
      ok: false
    })
  }

  const { error } = await supabase.auth.updateUser({
    password: pwNew
  })

  if (error) {
    return setPwStatus({
      msg: error.message,
      ok: false
    })
  }

  setPwOld('')
  setPwNew('')
  setPwNew2('')

  setPwStatus({
    msg: 'เปลี่ยนรหัสผ่านแล้ว ✅',
    ok: true
  })
}

  function handleSaveGeneral() {
    localStorage.setItem('notify', notify)
    localStorage.setItem('lang', lang)
    localStorage.setItem('tz', tz)
    setGeneralStatus('บันทึกแล้ว ✅')
    setTimeout(() => setGeneralStatus(''), 2000)
  }

  function handleWipe() {
    if (!confirm('ยืนยันลบข้อมูลทั้งหมดจริงหรือไม่?')) return
    localStorage.setItem('inv_inventory', JSON.stringify([]))
    localStorage.setItem('inv_requests', JSON.stringify([]))
    localStorage.setItem('inv_returns', JSON.stringify([]))
    setWipeStatus({ msg: 'ลบข้อมูลเรียบร้อย ✅', ok: true })
    setWipeConfirm(false)
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">⚙️ ตั้งค่าระบบ</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {user?.email} ({user?.role})
            </p>
          </div>
        </header>

        {/* เปลี่ยนรหัสผ่าน */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">🔐 เปลี่ยนรหัสผ่าน</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              type="password" value={pwOld}
              onChange={e => setPwOld(e.target.value)}
              placeholder="รหัสผ่านปัจจุบัน"
              className="border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
            />
            <input
              type="password" value={pwNew}
              onChange={e => setPwNew(e.target.value)}
              placeholder="รหัสผ่านใหม่"
              className="border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
            />
            <input
              type="password" value={pwNew2}
              onChange={e => setPwNew2(e.target.value)}
              placeholder="ยืนยันรหัสผ่านใหม่"
              className="border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleChangePw}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm"
            >
              บันทึกการเปลี่ยนรหัส
            </button>
            {pwStatus.msg && (
              <span className={`text-sm ${pwStatus.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                {pwStatus.msg}
              </span>
            )}
          </div>
        </section>

        {/* ธีม */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">🎨 ธีมการแสดงผล</h2>
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={dark}
              onChange={e => applyTheme(e.target.checked)}
              className="w-5 h-5"
            />
            <span>เปิดโหมดมืด (Dark Mode)</span>
          </label>
          <p className="text-xs text-gray-400 mt-2">จะจำค่าที่เลือกไว้และใช้ทันทีในทุกหน้า</p>
        </section>

        {/* การแจ้งเตือน */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">🔔 การแจ้งเตือน</h2>
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notify}
              onChange={e => setNotify(e.target.checked)}
              className="w-5 h-5"
            />
            <span>เปิดการแจ้งเตือนการเปลี่ยนสถานะคำขอเบิก</span>
          </label>
        </section>

        {/* ทั่วไป */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">🌍 ทั่วไป</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">ภาษา</label>
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
              >
                <option value="th">ไทย (Thai)</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Timezone</label>
              <select
                value={tz}
                onChange={e => setTz(e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
              >
                <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Singapore">Asia/Singapore</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleSaveGeneral}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm"
            >
              บันทึกการตั้งค่าทั่วไป
            </button>
            {generalStatus && (
              <span className="text-sm text-emerald-600">{generalStatus}</span>
            )}
          </div>
        </section>

        {/* ลบข้อมูล */}
        {user?.role === 'admin' && (
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 border border-rose-200 dark:border-rose-800">
            <h2 className="text-lg font-semibold mb-2 text-rose-600">⚠️ ลบข้อมูลทั้งหมด</h2>
            <p className="text-sm mb-3 text-gray-500">
              คำเตือน: จะลบ requests และ inventory ทั้งหมด (ย้อนกลับไม่ได้)
            </p>
            <label className="inline-flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wipeConfirm}
                onChange={e => setWipeConfirm(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-sm">ฉันเข้าใจความเสี่ยงและยืนยันที่จะลบ</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={handleWipe}
                disabled={!wipeConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-40"
              >
                ลบข้อมูลทั้งหมดตอนนี้
              </button>
              {wipeStatus.msg && (
                <span className={`text-sm ${wipeStatus.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {wipeStatus.msg}
                </span>
              )}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}