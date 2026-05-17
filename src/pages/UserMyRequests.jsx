import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import { getMyBorrowRequests } from '../services/requestService'

export default function UserMyRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])

  useEffect(() => { load() }, [])

async function load() {
  try {
    const data = await getMyBorrowRequests()
    setRequests(data)
  } catch (error) {
    console.log(error.message)
  }
}

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">📮 สถานะคำขอของฉัน</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {user?.email} ({user?.role})
            </p>
          </div>
          <button
            onClick={load}
            className="border rounded-xl px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm"
          >
            🔄 โหลดข้อมูลอีกครั้ง
          </button>
        </header>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-2">วันที่ขอ</th>
                <th className="px-4 py-2">JOB ID</th>
                <th className="px-4 py-2">รายการ</th>
                <th className="px-4 py-2">จำนวน</th>
                <th className="px-4 py-2">สถานะ</th>
                <th className="px-4 py-2">หมายเหตุผู้ดูแล</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-10">
                    ยังไม่มีคำขอ
                  </td>
                </tr>
              )}
              {requests.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {new Date(r.created_at || r.borrow_date).toLocaleString('th-TH')}
                  </td>
                  <td className="px-4 py-2 font-mono">{r.job_id || '-'}</td>
                  <td className="px-4 py-2">{r.equipment?.name || '-'}</td>
                  <td className="px-4 py-2">{r.quantity}</td>
                  <td className="px-4 py-2"><Badge status={r.status} /></td>
                  <td className="px-4 py-2">{r.admin_note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}