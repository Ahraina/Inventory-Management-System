import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { getInventory, saveInventory } from '../data/store'

export default function AdminInventory() {
  const [inventory, setInventory] = useState([])
  const [search, setSearch] = useState('')
  const [newItem, setNewItem] = useState({ category: '', item: '', stock: '' })
  const [status, setStatus] = useState({ msg: '', ok: true })

  useEffect(() => { load() }, [])

  function load() {
    setInventory(getInventory())
  }

  function handleAdd() {
    if (!newItem.category || !newItem.item || !newItem.stock) {
      return setStatus({ msg: 'กรอกข้อมูลให้ครบ', ok: false })
    }
    const inv = getInventory()
    const idx = inv.findIndex(i => i.item.toLowerCase() === newItem.item.toLowerCase())
    if (idx !== -1) {
      inv[idx].stock = Math.max(0, inv[idx].stock + Number(newItem.stock))
    } else {
      inv.push({
        id: crypto.randomUUID(),
        category: newItem.category.trim(),
        item: newItem.item.trim(),
        stock: Number(newItem.stock)
      })
    }
    saveInventory(inv)
    setNewItem({ category: '', item: '', stock: '' })
    setStatus({ msg: 'เพิ่มสินค้าเรียบร้อย', ok: true })
    load()
  }

  function handleDelete(id) {
    if (!confirm('ยืนยันลบสินค้านี้?')) return
    const inv = getInventory().filter(i => i.id !== id)
    saveInventory(inv)
    load()
  }

  function handleStockEdit(id, val) {
    const inv = getInventory()
    const idx = inv.findIndex(i => i.id === id)
    if (idx !== -1) {
      inv[idx].stock = Math.max(0, Number(val))
      saveInventory(inv)
      load()
    }
  }

  const filtered = inventory.filter(i =>
    !search ||
    i.item.toLowerCase().includes(search.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const LOW = 3

  function stockColor(n) {
    if (n <= 0) return 'text-rose-600 font-bold'
    if (n <= LOW) return 'text-amber-600 font-bold'
    return 'text-emerald-600 font-bold'
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">📦 จัดการคลังอุปกรณ์</h1>

        {/* เพิ่มสินค้า */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-4">➕ เพิ่มสินค้า / เติมสต็อก</h2>
          <div className="flex flex-wrap gap-2">
            <input
              value={newItem.category}
              onChange={e => setNewItem({ ...newItem, category: e.target.value })}
              placeholder="หมวดหมู่"
              className="border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm flex-1 min-w-[140px] bg-white dark:bg-slate-900"
            />
            <input
              value={newItem.item}
              onChange={e => setNewItem({ ...newItem, item: e.target.value })}
              placeholder="ชื่อสินค้า"
              className="border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm flex-1 min-w-[140px] bg-white dark:bg-slate-900"
            />
            <input
              type="number" min="1"
              value={newItem.stock}
              onChange={e => setNewItem({ ...newItem, stock: e.target.value })}
              placeholder="จำนวน"
              className="border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm w-28 bg-white dark:bg-slate-900"
            />
            <button
              onClick={handleAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm"
            >
              + เพิ่ม
            </button>
          </div>
          {status.msg && (
            <p className={`mt-2 text-sm ${status.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
              {status.msg}
            </p>
          )}
        </section>

        {/* ตารางสินค้า */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">รายการสินค้าทั้งหมด ({inventory.length} รายการ)</h2>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหา..."
              className="border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-900"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700 text-gray-500">
                  <th className="text-left px-4 py-2 rounded-l-lg">หมวดหมู่</th>
                  <th className="text-left px-4 py-2">สินค้า</th>
                  <th className="text-center px-4 py-2">คงเหลือ</th>
                  <th className="text-center px-4 py-2 rounded-r-lg">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-8">
                      ไม่มีสินค้า
                    </td>
                  </tr>
                )}
                {filtered.map(i => (
                  <tr key={i.id} className="border-t">
                    <td className="px-4 py-2 text-gray-500">{i.category}</td>
                    <td className="px-4 py-2 font-medium">{i.item}</td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="number" min="0"
                        defaultValue={i.stock}
                        onBlur={e => handleStockEdit(i.id, e.target.value)}
                        className={`w-20 text-center border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 ${stockColor(i.stock)}`}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleDelete(i.id)}
                        className="text-rose-500 hover:text-rose-700 text-xs border border-rose-200 px-2 py-1 rounded-lg"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  )
}