import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import {
  getMyApprovedBorrowRequests,
  createReturnRequest,
  getMyReturnRequests,
} from '../services/requestService'

export default function UserReturns() {
  const { user } = useAuth()
  const [returnables, setReturnables] = useState([])
  const [selected, setSelected] = useState({})
  const [notes, setNotes] = useState({})
  const [status, setStatus] = useState({ msg: '', ok: true })

  useEffect(() => { load() }, [])

  async function load() {
  try {
    const reqs = await getMyApprovedBorrowRequests()
    const rets = await getMyReturnRequests()

    const retMap = {}

    rets.forEach(r => {
      const key = r.borrow_request_id

      retMap[key] = (retMap[key] || 0) + Number(r.quantity)
    })

    const list = reqs.map(r => {
      const returned = retMap[r.id] || 0

      const remain =
        Math.max(0, Number(r.quantity) - returned)

      return {
        id: r.id,
        job_id: r.job_id,
        item: r.equipment?.name || '-',
        qty: r.quantity,
        returned,
        remain
      }
    }).filter(r => r.remain > 0)

    setReturnables(list)
    setSelected({})
    setNotes({})

  } catch (error) {
    console.log(error.message)
  }
}

  function toggleSelect(key, checked) {
    setSelected(prev => ({ ...prev, [key]: checked }))
  }

  function selectAll(checked) {
    const next = {}
    returnables.forEach(r => {
      next[r.job_id + '|' + r.item] = checked
    })
    setSelected(next)
  }

 async function handleSubmit() {
    const rows = returnables.filter(r => {
      const key = r.job_id + '|' + r.item
      return selected[key]
    })

    if (!rows.length) {
      return setStatus({ msg: 'ยังไม่ได้เลือกรายการคืน', ok: false })
    }

    for (const r of rows) {
      const key = r.job_id + '|' + r.item
      const qty = Number(document.getElementById('qty_' + key)?.value || 1)
      if (qty <= 0 || qty > r.remain) {
        return setStatus({ msg: `จำนวนไม่ถูกต้องสำหรับ ${r.item}`, ok: false })
      }
      await createReturnRequest({
        borrow_request_id: r.id,
        quantity: qty,
        note: notes[key] || '',
        status: 'pending'
      })
    }

    setStatus({ msg: `✅ ส่งคำขอคืน ${rows.length} รายการเรียบร้อย (รอ Admin อนุมัติ)`, ok: true })
    load()
  }

  const allSelected = returnables.length > 0 &&
    returnables.every(r => selected[r.job_id + '|' + r.item])

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">↩️ คืนของเบิก</h1>
          <button
            onClick={load}
            className="border rounded-xl px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm"
          >
            🔄 โหลดข้อมูล
          </button>
        </header>

        {returnables.length === 0
          ? <div className="text-center text-gray-400 py-10 bg-white dark:bg-slate-800 rounded-2xl shadow">
              ไม่มีรายการที่ยังคืนได้
            </div>
          : <>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 dark:bg-slate-700">
                    <tr>
                      <th className="px-3 py-2 w-16">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={e => selectAll(e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-xs">เลือก</span>
                        </label>
                      </th>
                      <th className="px-3 py-2">JOB</th>
                      <th className="px-3 py-2">อุปกรณ์</th>
                      <th className="px-3 py-2">เบิก</th>
                      <th className="px-3 py-2">คืนแล้ว</th>
                      <th className="px-3 py-2">คงคืนได้</th>
                      <th className="px-3 py-2 w-28">จะคืน</th>
                      <th className="px-3 py-2 w-48">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnables.map(r => {
                      const key = r.job_id + '|' + r.item
                      const isChecked = !!selected[key]
                      return (
                        <tr key={key} className="border-t">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => toggleSelect(key, e.target.checked)}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="px-3 py-2 font-mono">{r.job_id}</td>
                          <td className="px-3 py-2">{r.item}</td>
                          <td className="px-3 py-2">{r.qty}</td>
                          <td className="px-3 py-2">{r.returned}</td>
                          <td className="px-3 py-2 font-semibold text-indigo-600">{r.remain}</td>
                          <td className="px-3 py-2">
                            <input
                              id={'qty_' + key}
                              type="number"
                              min="1"
                              max={r.remain}
                              defaultValue={1}
                              disabled={!isChecked}
                              className="w-20 border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 disabled:opacity-40"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              placeholder="หมายเหตุ"
                              disabled={!isChecked}
                              value={notes[key] || ''}
                              onChange={e => setNotes(prev => ({ ...prev, [key]: e.target.value }))}
                              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-slate-900 disabled:opacity-40"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectAll(true)}
                  className="border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  เลือกทั้งหมด
                </button>
                <button
                  onClick={() => selectAll(false)}
                  className="border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  ล้างทั้งหมด
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl"
                >
                  📤 ส่งคืน
                </button>
                {status.msg && (
                  <span className={`text-sm ${status.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {status.msg}
                  </span>
                )}
              </div>
            </>
        }
      </div>
    </Layout>
  )
}