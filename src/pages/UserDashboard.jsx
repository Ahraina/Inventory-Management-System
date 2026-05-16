import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  getInventory, getRequests,
  getReturns, addRequest, addReturn
} from '../data/store'

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('request')
  const [inventory, setInventory] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [myReturns, setMyReturns] = useState([])

  // ฟอร์มเบิก
  const [jobId, setJobId] = useState('')
  const [rows, setRows] = useState([{ item: '', qty: 1, reason: '' }])

  // ฟอร์มคืน
  const [returnJob, setReturnJob] = useState('')
  const [returnItem, setReturnItem] = useState('')
  const [returnQty, setReturnQty] = useState(1)
  const [returnNote, setReturnNote] = useState('')

  const [msg, setMsg] = useState({ text: '', ok: true })

  useEffect(() => { refresh() }, [])

  function refresh() {
    setInventory(getInventory())
    setMyRequests(getRequests().filter(r => r.who === user.email)
      .sort((a, b) => new Date(b.when) - new Date(a.when)))
    setMyReturns(getReturns().filter(r => r.who === user.email)
      .sort((a, b) => new Date(b.when) - new Date(a.when)))
  }

  function showMsg(text, ok = true) {
    setMsg({ text, ok })
    setTimeout(() => setMsg({ text: '', ok: true }), 3000)
  }

  // ── เบิกของ ──
  function addRow() { setRows([...rows, { item: '', qty: 1, reason: '' }]) }
  function removeRow(i) { setRows(rows.filter((_, idx) => idx !== i)) }
  function updateRow(i, field, value) {
    const next = [...rows]
    next[i][field] = value
    setRows(next)
  }

  function handleRequest() {
    if (!jobId.trim()) return showMsg('กรุณาระบุ Job ID', false)
    const cleaned = rows.filter(r => r.item && r.qty > 0)
    if (!cleaned.length) return showMsg('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ', false)

    // เช็กสต็อก
    for (const r of cleaned) {
      const inv = inventory.find(i => i.item === r.item)
      if (!inv || inv.stock <= 0) return showMsg(`${r.item} ไม่มีในคลัง`, false)
      if (r.qty > inv.stock) return showMsg(`${r.item} คงเหลือไม่พอ (เหลือ ${inv.stock})`, false)
    }

    addRequest(jobId.trim().toUpperCase(), cleaned, user.email)
    setJobId('')
    setRows([{ item: '', qty: 1, reason: '' }])
    showMsg('ส่งคำขอเบิกสำเร็จ รอ Admin อนุมัติ')
    refresh()
  }

  // ── คืนของ ──
  // หา approved ที่ยังคืนได้
  const returnables = myRequests
    .filter(r => r.status === 'approved')
    .map(r => {
      const returned = myReturns
        .filter(x => x.job_id === r.job_id && x.item === r.item && x.status === 'approved')
        .reduce((s, x) => s + x.qty, 0)
      return { ...r, remain: Math.max(0, r.qty - returned) }
    })
    .filter(r => r.remain > 0)

  function handleReturn() {
    if (!returnJob || !returnItem) return showMsg('กรุณาเลือกรายการที่ต้องการคืน', false)
    if (returnQty <= 0) return showMsg('จำนวนต้องมากกว่า 0', false)
    const target = returnables.find(r => r.job_id === returnJob && r.item === returnItem)
    if (!target) return showMsg('ไม่พบสิทธิ์คืน', false)
    if (returnQty > target.remain) return showMsg(`คืนเกินสิทธิ์ (เหลือได้ ${target.remain})`, false)

    addReturn(returnJob, returnItem, returnQty, returnNote, user.email)
    setReturnJob('')
    setReturnItem('')
    setReturnQty(1)
    setReturnNote('')
    showMsg('ส่งคำขอคืนสำเร็จ รอ Admin อนุมัติ')
    refresh()
  }

  function handleLogout() { logout(); navigate('/') }

  const statusBadge = (s) => {
    if (s === 'approved') return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">อนุมัติ</span>
    if (s === 'rejected') return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">ปฏิเสธ</span>
    return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">รอดำเนินการ</span>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">📦 ระบบเบิก-ยืม-คืน</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.name}</span>
          <button onClick={handleLogout} className="bg-white text-indigo-600 text-sm px-3 py-1 rounded-lg font-medium">
            ออกจากระบบ
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="flex gap-2 px-6 pt-6">
        {[
          { key: 'request',  label: '📋 เบิกของ' },
          { key: 'return',   label: '↩️ คืนของ' },
          { key: 'history',  label: '🕐 ประวัติ' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-indigo-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-4">
        {/* Flash Message */}
        {msg.text && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
            msg.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {msg.text}
          </div>
        )}

        {/* เบิกของ */}
        {tab === 'request' && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="font-bold text-lg">เบิกอุปกรณ์</h2>
            <div>
              <label className="text-sm font-medium text-gray-700">Job ID</label>
              <input value={jobId} onChange={e => setJobId(e.target.value)}
                placeholder="เช่น JOB-001"
                className="mt-1 w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            {rows.map((r, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-center border rounded-xl p-3">
                <select value={r.item} onChange={e => updateRow(i, 'item', e.target.value)}
                  className="border rounded-lg px-2 py-1.5 text-sm flex-1 min-w-[140px]">
                  <option value="">-- เลือกสินค้า --</option>
                  {inventory.filter(inv => inv.stock > 0).map(inv => (
                    <option key={inv.id} value={inv.item}>{inv.item} (เหลือ {inv.stock})</option>
                  ))}
                </select>
                <input type="number" min="1" value={r.qty}
                  onChange={e => updateRow(i, 'qty', Number(e.target.value))}
                  className="border rounded-lg px-2 py-1.5 text-sm w-20" />
                <input value={r.reason} onChange={e => updateRow(i, 'reason', e.target.value)}
                  placeholder="เหตุผล"
                  className="border rounded-lg px-2 py-1.5 text-sm flex-1 min-w-[120px]" />
                {rows.length > 1 && (
                  <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 text-lg">✕</button>
                )}
              </div>
            ))}

            <div className="flex gap-2">
              <button onClick={addRow}
                className="border border-indigo-400 text-indigo-600 text-sm px-4 py-2 rounded-xl hover:bg-indigo-50">
                + เพิ่มรายการ
              </button>
              <button onClick={handleRequest}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-6 py-2 rounded-xl">
                ส่งคำขอ
              </button>
            </div>
          </div>
        )}

        {/* คืนของ */}
        {tab === 'return' && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="font-bold text-lg">คืนอุปกรณ์</h2>
            {returnables.length === 0
              ? <p className="text-gray-400 text-sm">ไม่มีรายการที่ต้องคืน</p>
              : <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">เลือกรายการที่ต้องการคืน</label>
                    <select value={returnJob + '|' + returnItem}
                      onChange={e => {
                        const [j, it] = e.target.value.split('|')
                        setReturnJob(j); setReturnItem(it)
                      }}
                      className="mt-1 w-full border rounded-xl px-3 py-2 text-sm">
                      <option value="|">-- เลือก --</option>
                      {returnables.map((r, i) => (
                        <option key={i} value={r.job_id + '|' + r.item}>
                          {r.job_id} — {r.item} (คืนได้ {r.remain})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">จำนวน</label>
                    <input type="number" min="1" value={returnQty}
                      onChange={e => setReturnQty(Number(e.target.value))}
                      className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">หมายเหตุ</label>
                    <input value={returnNote} onChange={e => setReturnNote(e.target.value)}
                      placeholder="เช่น คืนสภาพดี"
                      className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" />
                  </div>
                  <button onClick={handleReturn}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-6 py-2 rounded-xl">
                    ส่งคำขอคืน
                  </button>
                </>
            }
          </div>
        )}

        {/* ประวัติ */}
        {tab === 'history' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-bold text-lg mb-4">ประวัติการเบิก</h2>
              {myRequests.length === 0 && <p className="text-gray-400 text-sm">ไม่มีประวัติ</p>}
              <div className="space-y-2">
                {myRequests.map(r => (
                  <div key={r.id} className="border rounded-xl p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{r.item} x{r.qty}</p>
                        <p className="text-sm text-gray-500">JOB: {r.job_id}</p>
                        <p className="text-sm text-gray-500">เหตุผล: {r.reason}</p>
                        {r.admin_note && <p className="text-sm text-indigo-500">โน้ต: {r.admin_note}</p>}
                      </div>
                      {statusBadge(r.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-bold text-lg mb-4">ประวัติการคืน</h2>
              {myReturns.length === 0 && <p className="text-gray-400 text-sm">ไม่มีประวัติ</p>}
              <div className="space-y-2">
                {myReturns.map(r => (
                  <div key={r.id} className="border rounded-xl p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{r.item} x{r.qty}</p>
                        <p className="text-sm text-gray-500">JOB: {r.job_id}</p>
                        <p className="text-sm text-gray-500">หมายเหตุ: {r.note || '-'}</p>
                      </div>
                      {statusBadge(r.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}