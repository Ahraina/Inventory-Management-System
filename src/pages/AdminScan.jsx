import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import { getInventory, saveInventory } from '../data/store'

export default function AdminScan() {
  const [category, setCategory] = useState('')
  const [itemName, setItemName] = useState('')
  const [scan, setScan] = useState('')
  const [qty, setQty] = useState(1)
  const [status, setStatus] = useState({ msg: '', ok: true })
  const [inventory, setInventory] = useState([])
  const [search, setSearch] = useState('')
  const [recent, setRecent] = useState([])
  const scanRef = useRef(null)

  const LOW = 3
  const categories = [...new Set(getInventory().map(i => i.category))].filter(Boolean)

  useEffect(() => {
    loadInventory()
    scanRef.current?.focus()
  }, [])

  function loadInventory() {
    setInventory(getInventory())
  }

  function doSave() {
    if (!category) return setStatus({ msg: 'กรุณาเลือกหมวดหมู่', ok: false })
    if (!itemName.trim()) return setStatus({ msg: 'กรุณาใส่ชื่อ/สเปกสินค้า', ok: false })
    if (qty <= 0) return setStatus({ msg: 'จำนวนต้องมากกว่า 0', ok: false })

    const inv = getInventory()
    const idx = inv.findIndex(i => i.item.toLowerCase() === itemName.trim().toLowerCase())
    if (idx !== -1) {
      inv[idx].stock = Math.max(0, inv[idx].stock + qty)
    } else {
      inv.push({
        id: crypto.randomUUID(),
        category,
        item: itemName.trim(),
        stock: qty
      })
    }
    saveInventory(inv)

    const newEntry = {
      barcode: scan,
      item: itemName.trim(),
      category,
      qty,
      at: new Date().toLocaleString('th-TH')
    }
    setRecent(prev => [newEntry, ...prev].slice(0, 10))
    setStatus({ msg: `บันทึกแล้ว: ${itemName} (+${qty}) ในหมวด ${category}`, ok: true })
    setScan('')
    setQty(1)
    loadInventory()
    scanRef.current?.focus()
  }

  const filtered = inventory.filter(i =>
    !search || i.item.toLowerCase().includes(search.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  )

  function stockTone(n) {
    if (n <= 0) return 'bg-rose-50 text-rose-700 border-rose-200'
    if (n <= LOW) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">สแกนบาร์โค้ด</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scan Form */}
          <section className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow p-5 space-y-4">
            <h2 className="font-semibold">เพิ่มสินค้าเข้าคลัง (Admin)</h2>

            {/* หมวดหมู่ */}
            <div>
              <label className="block text-sm mb-1">หมวดหมู่อุปกรณ์</label>
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
                >
                  <option value="">— เลือกหมวดหมู่ —</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__new__">+ เพิ่มหมวดหมู่ใหม่</option>
                </select>
              </div>
              {category === '__new__' && (
                <input
                  autoFocus
                  placeholder="พิมพ์หมวดหมู่ใหม่"
                  onChange={e => setCategory(e.target.value)}
                  className="mt-2 w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
                />
              )}
            </div>

            {/* สแกน + จำนวน */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">สแกนบาร์โค้ด</label>
                <input
                  ref={scanRef}
                  value={scan}
                  onChange={e => {
                    setScan(e.target.value)
                    if (!itemName) setItemName(e.target.value)
                  }}
                  onKeyDown={e => e.key === 'Enter' && doSave()}
                  placeholder="โฟกัสช่องนี้ แล้วสแกน…"
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">จำนวน</label>
                <input
                  type="number" min="1" value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            {/* ชื่อสินค้า */}
            <div>
              <label className="block text-sm mb-1">ชื่อ/สเปกสินค้า</label>
              <input
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                placeholder='เช่น "Harddisk PC SATA 250 GB"'
                className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={doSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl"
              >
                ➕ เพิ่มเข้าคลัง
              </button>
              {status.msg && (
                <span className={`text-sm ${status.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {status.msg}
                </span>
              )}
            </div>

            {/* Recent */}
            {recent.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 text-sm">รายการล่าสุด</h3>
                <div className="space-y-2">
                  {recent.map((r, i) => (
                    <div key={i} className="flex justify-between items-center border rounded-xl px-3 py-2 bg-gray-50 dark:bg-slate-900 text-sm">
                      <div>
                        <span className="font-medium">{r.item}</span>
                        <span className="text-gray-400 ml-2">— {r.category}</span>
                        {r.barcode && <span className="text-gray-400 ml-2 text-xs">({r.barcode})</span>}
                      </div>
                      <span className="text-gray-400 text-xs">+{r.qty} • {r.at}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Stock Panel */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">สต็อกคงเหลือ</h2>
              <button onClick={loadInventory}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg">
                🔄 รีเฟรช
              </button>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหา..."
              className="w-full mb-3 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-900"
            />
            <div className="space-y-2">
              {filtered.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">ไม่มีข้อมูล</p>
              )}
              {filtered.map(i => (
                <div key={i.id} className="border rounded-xl p-2 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{i.item}</div>
                      <div className="text-xs text-gray-400">{i.category}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${stockTone(i.stock)}`}>
                      {i.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}