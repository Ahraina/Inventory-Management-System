import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { getEquipment } from '../services/equipmentService'

export default function UserInventory() {
  const [inventory, setInventory] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

async function load() {
  try {
    const data = await getEquipment()
    setInventory(data)
  } catch (error) {
    console.log(error.message)
  }
}

  const LOW = 3

  function stockTone(n) {
    if (n <= 0) return 'bg-rose-50 text-rose-700 border-rose-200'
    if (n <= LOW) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  const filtered = inventory.filter(i =>
    !search ||
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  )

  // จัดกลุ่มตาม category
  const grouped = filtered.reduce((acc, i) => {
    const cat = i.category || 'อื่นๆ'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(i)
    return acc
  }, {})

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">📦 สต็อกคงเหลือทั้งหมด</h1>
          <button
            onClick={load}
            className="border rounded-xl px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm"
          >
            🔄 รีเฟรช
          </button>
        </header>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาสินค้า หรือ หมวดหมู่..."
          className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-900"
        />

        {/* สรุป */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'รายการทั้งหมด', value: inventory.length, color: 'text-indigo-600' },
            { label: 'ใกล้หมด (≤3)', value: inventory.filter(i => i.available_quantity > 0 && i.available_quantity <= LOW).length, color: 'text-amber-600' },
            { label: 'หมดสต็อก', value: inventory.filter(i => i.available_quantity <= 0).length, color: 'text-rose-600' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* grouped items */}
        {Object.keys(grouped).length === 0 && (
          <div className="text-center text-gray-400 py-10">ไม่มีสินค้า</div>
        )}

        {Object.entries(grouped).map(([cat, items]) => (
          <section key={cat} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-5">
            <h2 className="font-semibold mb-3 text-indigo-600">📁 {cat}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(i => (
                <div
                  key={i.id}
                  className="border border-gray-100 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                      <div className="font-medium text-sm">{i.name}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${stockTone(i.available_quantity)}`}>
                        {i.available_quantity}
                      </span>
                    </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Layout>
  )
}