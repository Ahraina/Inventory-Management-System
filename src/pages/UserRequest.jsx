import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { getEquipment } from '../services/equipmentService'
import { createBorrowRequest } from '../services/requestService'

export default function UserRequest() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState([])
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [jobId, setJobId] = useState('')
  const [cart, setCart] = useState([])
  const [item, setItem] = useState('')
  const [qty, setQty] = useState(1)
  const [reason, setReason] = useState('')
  const [search, setSearch] = useState('')
  const [addStatus, setAddStatus] = useState({ msg: '', ok: true })
  const [submitStatus, setSubmitStatus] = useState({ msg: '', ok: true })

  useEffect(() => { load() }, [])

  async function load() {
  try {
    const inv = await getEquipment()
    setInventory(inv)
    const cats = [...new Set(inv.map(i => i.category))].filter(Boolean).sort()
    setCategories(cats)
  } catch (error) {
    console.log(error.message)
  }
}

  const filteredItems = inventory
  .filter(i => i.available_quantity > 0)
  .filter(i => !category || i.category === category)
  .filter(i => !search || (i.name || '').toLowerCase().includes(search.toLowerCase()))
  .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'th'))

  function handleAdd() {
  if (!item || qty <= 0) {
    return setAddStatus({ msg: 'กรอกข้อมูลให้ถูกต้อง', ok: false })
  }

  const inv = inventory.find(i => String(i.id) === String(item))

  if (!inv || inv.available_quantity <= 0) {
    return setAddStatus({ msg: 'อุปกรณ์นี้ไม่มีในคลัง', ok: false })
  }

  if (qty > inv.available_quantity) {
    return setAddStatus({
      msg: `${inv.name} คงเหลือไม่พอ (เหลือ ${inv.available_quantity})`,
      ok: false
    })
  }

  const cat = category || inv.category || ''

  setCart(prev => [
    ...prev,
    {
      equipment_id: inv.id,
      category: cat,
      item: inv.name,
      qty,
      reason
    }
  ])

  setItem('')
  setQty(1)
  setReason('')
  setAddStatus({ msg: 'เพิ่มแล้ว', ok: true })
}

  function removeFromCart(i) {
    setCart(prev => prev.filter((_, idx) => idx !== i))
  }

 async function handleSubmit() {
  console.log('submit clicked')
  console.log('jobId:', jobId)
  console.log('cart:', cart)

  if (!jobId.trim()) {
    return setSubmitStatus({ msg: 'กรุณากรอก Job ID', ok: false })
  }

  if (!cart.length) {
    return setSubmitStatus({ msg: 'ยังไม่มีรายการ', ok: false })
  }

  try {
    for (const r of cart) {
      console.log('sending request:', r)

      await createBorrowRequest({
        user_id: user.id,
        equipment_id: r.equipment_id,
        quantity: r.qty,
        job_id: jobId.trim().toUpperCase(),
        borrow_date: new Date().toISOString().split('T')[0],
        status: 'pending'
      })
    }

    setCart([])
    setJobId('')
    setSubmitStatus({
      msg: `✅ ส่งคำขอแล้ว (JOB: ${jobId.trim().toUpperCase()})`,
      ok: true
    })

    await load()
  } catch (error) {
    console.error('Create request error:', error)
    setSubmitStatus({
      msg: error.message || 'ส่งคำขอไม่สำเร็จ',
      ok: false
    })
  }
}

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">📝 ขอเบิกอุปกรณ์</h1>
        </header>

        {/* Job ID */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <label className="block text-sm mb-1 font-medium">หมายเลขงาน (Job ID) *</label>
          <input
            value={jobId}
            onChange={e => setJobId(e.target.value)}
            placeholder="กรอกหมายเลขงาน เช่น JOB-001"
            className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
          />
          <p className="mt-1 text-xs text-gray-400">* จำเป็นต้องกรอกหมายเลขงาน</p>
        </section>

        {/* เพิ่มรายการ */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold">เพิ่มรายการขอเบิก</h2>

          <div className="grid sm:grid-cols-3 gap-3">
            {/* หมวดหมู่ */}
            <div>
              <label className="block text-sm mb-1">หมวดหมู่</label>
              <select
                value={category}
                onChange={e => { setCategory(e.target.value); setItem('') }}
                className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
              >
                <option value="">— ทั้งหมด —</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* ค้นหา + เลือกสินค้า */}
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">ชื่ออุปกรณ์</label>
              <div className="flex gap-2">
                <select
                  value={item}
                  onChange={e => setItem(e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
                >
                  <option value="">-- เลือกอุปกรณ์ --</option>
                  {filteredItems.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} (คงเหลือ: {i.available_quantity})
                    </option>
                  ))}
                </select>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ค้นหา..."
                  className="w-32 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900 text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {filteredItems.length > 0
                  ? `เลือกจาก ${filteredItems.length} รายการ`
                  : 'ไม่มีรายการในหมวด/คำค้นนี้'}
              </p>
            </div>

            {/* จำนวน */}
            <div>
              <label className="block text-sm mb-1">จำนวน</label>
              <input
                type="number" min="1" value={qty}
                onChange={e => setQty(Number(e.target.value))}
                className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* เหตุผล */}
          <div>
            <label className="block text-sm mb-1">หมายเหตุ (ไม่จำเป็น)</label>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="ระบุเหตุผล"
              className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm"
            >
              ➕ เพิ่มลงรายการขอเบิก
            </button>
            <button
              onClick={load}
              className="border px-3 py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              🔄 รีโหลดรายการ
            </button>
            {addStatus.msg && (
              <span className={`text-sm ${addStatus.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                {addStatus.msg}
              </span>
            )}
          </div>
        </section>

        {/* ตะกร้า */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">🧺 รายการขอเบิก</h2>
            <button
              onClick={() => setCart([])}
              className="text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              ล้างรายการทั้งหมด
            </button>
          </div>

          {cart.length === 0
            ? <p className="text-center text-gray-400 py-6">ยังไม่มีรายการ</p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-3 py-2">หมวดหมู่</th>
                      <th className="px-3 py-2">อุปกรณ์</th>
                      <th className="px-3 py-2 w-20">จำนวน</th>
                      <th className="px-3 py-2">เหตุผล</th>
                      <th className="px-3 py-2 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{r.category || '-'}</td>
                        <td className="px-3 py-2">{r.item}</td>
                        <td className="px-3 py-2">{r.qty}</td>
                        <td className="px-3 py-2">{r.reason || '-'}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => removeFromCart(i)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }

          <button
            onClick={handleSubmit}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium py-3 rounded-xl transition shadow-md"
          >
            📤 ส่งคำขอทั้งหมด
          </button>

          {submitStatus.msg && (
            <p className={`mt-2 text-sm ${submitStatus.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
              {submitStatus.msg}
            </p>
          )}
        </section>
      </div>
    </Layout>
  )
}