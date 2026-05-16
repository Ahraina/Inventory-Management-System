import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import { getReturns, updateReturnStatus } from '../data/store'

export default function AdminReturns() {
  const [rows, setRows] = useState([])
  const [view, setView] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [notes, setNotes] = useState({})
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState([])

  useEffect(() => { load() }, [])
  useEffect(() => { applyFilter() }, [rows, search, filter])

  function load() {
    const data = getReturns().sort((a, b) => new Date(b.when) - new Date(a.when))
    setRows(data)
    setSelected([])
  }

  function applyFilter() {
    const q = search.toLowerCase()
    const f = filter.toLowerCase()
    setView(rows.filter(r => {
      const okF = f ? r.status.toLowerCase() === f : true
      const hay = [r.job_id, r.item, r.who].join(' ').toLowerCase()
      return okF && (!q || hay.includes(q))
    }))
  }

  function updateOne(id, st) {
    updateReturnStatus(id, st, notes[id] || '')
    setStatus(st === 'approved' ? '✅ อนุมัติแล้ว' : '❌ ปฏิเสธแล้ว')
    load()
  }

  function bulk(st) {
    if (!selected.length) return setStatus('ยังไม่ได้เลือกแถว')
    selected.forEach(id => updateReturnStatus(id, st, notes[id] || ''))
    setStatus(`${st === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'} ${selected.length} รายการแล้ว`)
    load()
  }

  function toggleSelect(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleAll(checked) {
    setSelected(checked ? view.map(r => r.id) : [])
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-bold">↩️ อนุมัติคำขอคืนของ (Admin)</h1>
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหา JOB / อีเมล / รายการ"
              className="border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-sm"
            />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-sm"
            >
              <option value="">สถานะทั้งหมด</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
            </select>
            <button onClick={load}
              className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-sm">
              🔄 โหลด
            </button>
            <button onClick={() => bulk('approved')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-sm">
              ✅ อนุมัติที่เลือก
            </button>
            <button onClick={() => bulk('rejected')}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl text-sm">
              ❌ ปฏิเสธที่เลือก
            </button>
          </div>
        </header>

        {status && (
          <div className="text-sm text-indigo-600 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl">
            {status}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-slate-700">
              <tr>
                <th className="px-3 py-2 w-9">
                  <input type="checkbox"
                    checked={selected.length === view.length && view.length > 0}
                    onChange={e => toggleAll(e.target.checked)}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-3 py-2">วันที่ขอคืน</th>
                <th className="px-3 py-2">JOB</th>
                <th className="px-3 py-2">อุปกรณ์</th>
                <th className="px-3 py-2">จำนวน</th>
                <th className="px-3 py-2">ผู้ขอคืน</th>
                <th className="px-3 py-2">สถานะ</th>
                <th className="px-3 py-2 w-48">โน้ตแอดมิน</th>
                <th className="px-3 py-2 w-36"></th>
              </tr>
            </thead>
            <tbody>
              {view.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-gray-400 py-10">
                    ไม่มีคำขอคืน
                  </td>
                </tr>
              )}
              {view.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">
                    <input type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(r.when).toLocaleString('th-TH')}
                  </td>
                  <td className="px-3 py-2 font-mono">{r.job_id || '-'}</td>
                  <td className="px-3 py-2">{r.item}</td>
                  <td className="px-3 py-2">{r.qty}</td>
                  <td className="px-3 py-2">{r.who}</td>
                  <td className="px-3 py-2"><Badge status={r.status} /></td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="โน้ต (ไม่บังคับ)"
                      value={notes[r.id] || ''}
                      onChange={e => setNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-slate-900"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateOne(r.id, 'approved')}
                        className="px-3 py-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 text-xs"
                      >
                        ✅ อนุมัติ
                      </button>
                      <button
                        onClick={() => updateOne(r.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg text-white bg-rose-600 hover:bg-rose-700 text-xs"
                      >
                        ❌ ปฏิเสธ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}