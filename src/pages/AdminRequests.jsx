import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import { getRequests, updateRequestStatus } from '../data/store'

export default function AdminRequests() {
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  function load() {
    const reqs = getRequests()
    // จัดกลุ่มเป็น JOB
    const groups = {}
    reqs.forEach(r => {
      if (!r.job_id) return
      if (!groups[r.job_id]) {
        groups[r.job_id] = { job_id: r.job_id, who: r.who, when: r.when, lines: [] }
      }
      groups[r.job_id].lines.push({
        id: r.id, item: r.item, qty: r.qty,
        reason: r.reason, status: r.status, admin_note: r.admin_note
      })
    })
    // คำนวณ status รวมของ JOB
    const list = Object.values(groups).map(g => {
      const statuses = new Set(g.lines.map(l => l.status))
      g.status = statuses.size === 1 ? [...statuses][0] : 'mixed'
      return g
    }).sort((a, b) => new Date(b.when) - new Date(a.when))
    setJobs(list)
  }

  function handleJobAction(job, action) {
    const status = action === 'approve' ? 'approved' : 'rejected'
    job.lines.forEach(line => {
      updateRequestStatus(line.id, status)
    })
    load()
  }

  const filtered = jobs.filter(j =>
    !search ||
    j.job_id.toLowerCase().includes(search.toLowerCase()) ||
    j.who.toLowerCase().includes(search.toLowerCase())
  )

  function jobStatusBadge(status) {
    if (status === 'approved') return <Badge status="approved" />
    if (status === 'rejected') return <Badge status="rejected" />
    if (status === 'mixed') return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">mixed</span>
    )
    return <Badge status="pending" />
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-bold">📦 จัดการคำขอเบิก</h1>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหา Job ID / อีเมล"
              className="border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-900"
            />
            <button onClick={load}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl">
              🔄 โหลดข้อมูลใหม่
            </button>
          </div>
        </header>

        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-10">ไม่มีคำขอ</div>
        )}

        <div className="space-y-4">
          {filtered.map(job => (
            <details
              key={job.job_id}
              open={job.status !== 'approved'}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow p-4"
            >
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">JOB: {job.job_id}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      ผู้ขอ: {job.who} • รายการ: {job.lines.length} •{' '}
                      ล่าสุด: {new Date(job.when).toLocaleString('th-TH')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {jobStatusBadge(job.status)}
                    {job.status !== 'approved' && (
                      <button
                        onClick={() => handleJobAction(job, 'approve')}
                        className="px-3 py-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 text-sm"
                      >
                        ✅ อนุมัติ
                      </button>
                    )}
                    {job.status !== 'rejected' && (
                      <button
                        onClick={() => handleJobAction(job, 'reject')}
                        className="px-3 py-1.5 rounded-lg text-white bg-rose-600 hover:bg-rose-700 text-sm"
                      >
                        ❌ ปฏิเสธ
                      </button>
                    )}
                  </div>
                </div>
              </summary>

              {/* Lines */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-3 py-2">รายการ</th>
                      <th className="px-3 py-2 w-20">จำนวน</th>
                      <th className="px-3 py-2">เหตุผล</th>
                      <th className="px-3 py-2 w-28">สถานะ</th>
                      <th className="px-3 py-2">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.lines.map((line, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{line.item}</td>
                        <td className="px-3 py-2">{line.qty}</td>
                        <td className="px-3 py-2">{line.reason || '-'}</td>
                        <td className="px-3 py-2"><Badge status={line.status} /></td>
                        <td className="px-3 py-2">{line.admin_note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      </div>
    </Layout>
  )
}