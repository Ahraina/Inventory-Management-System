import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import { getMyBorrowRequests } from '../services/requestService'

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    full_name: '', nickname: '', phone: '', department: ''
  })
  const [profileStatus, setProfileStatus] = useState({ msg: '', ok: true })
  const [myRequests, setMyRequests] = useState([])

  useEffect(() => {
  async function load() {

    // โหลด profile local
    const saved = localStorage.getItem('profile_' + user?.email)
    if (saved) setForm(JSON.parse(saved))

    // โหลดคำขอจาก DB
    try {
      const reqs = await getMyBorrowRequests()

      const mine = reqs
        .filter(r => r.user_id === user?.id)
        .slice(0, 10)

      setMyRequests(
        mine.map(r => ({
          id: r.id,
          when: r.created_at,
          job_id: r.job_id,
          item: r.equipment?.name || '-',
          qty: r.quantity,
          status: r.status
        }))
      )

    } catch (error) {
      console.log(error.message)
    }
  }

  load()
}, [])

  function handleSave() {
    localStorage.setItem('profile_' + user?.email, JSON.stringify(form))
    setProfileStatus({ msg: 'บันทึกเรียบร้อย ✅', ok: true })
    setTimeout(() => setProfileStatus({ msg: '', ok: true }), 2000)
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">👤 โปรไฟล์ของฉัน</h1>
          <div className="text-sm text-gray-500 dark:text-slate-400">
            {user?.email} ({user?.role})
          </div>
        </div>

        {/* ข้อมูลส่วนตัว */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📇 ข้อมูลส่วนตัว</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm mb-1">ชื่อ-นามสกุล</label>
              <input
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                placeholder="ชื่อ-นามสกุล"
                className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">ชื่อเล่น</label>
              <input
                value={form.nickname}
                onChange={e => setForm({ ...form, nickname: e.target.value })}
                placeholder="ชื่อเล่น"
                className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">เบอร์โทร</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="0xxxxxxxxx"
                className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">แผนก / ตำแหน่ง</label>
              <input
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                placeholder="เช่น IT / Support"
                className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm"
            >
              บันทึกข้อมูล
            </button>
            {profileStatus.msg && (
              <span className={`text-sm ${profileStatus.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                {profileStatus.msg}
              </span>
            )}
          </div>
        </section>

        {/* สรุปบัญชี */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📊 สรุปบัญชี</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'อีเมล', value: user?.email },
              { label: 'สิทธิ์', value: user?.role },
              { label: 'ชื่อ', value: user?.name || '-' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="text-gray-500 dark:text-slate-400">{s.label}</div>
                <div className="font-medium break-all mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* คำขอล่าสุด */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📦 คำขอเบิกของฉัน (ล่าสุด)</h2>
            <span className="text-sm text-gray-400">ล่าสุด {myRequests.length} รายการ</span>
          </div>

          {myRequests.length === 0
            ? <p className="text-center text-gray-400 py-6">ยังไม่มีคำขอ</p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-3 py-2">วันที่</th>
                      <th className="px-3 py-2">JOB</th>
                      <th className="px-3 py-2">รายการ</th>
                      <th className="px-3 py-2">จำนวน</th>
                      <th className="px-3 py-2">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.map(r => (
                      <tr key={r.id} className="border-t">
                        <td className="px-3 py-2 whitespace-nowrap">
                          {new Date(r.when).toLocaleString('th-TH')}
                        </td>
                        <td className="px-3 py-2 font-mono">{r.job_id || '-'}</td>
                        <td className="px-3 py-2">{r.item}</td>
                        <td className="px-3 py-2">{r.qty}</td>
                        <td className="px-3 py-2"><Badge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </section>
      </div>
    </Layout>
  )
}