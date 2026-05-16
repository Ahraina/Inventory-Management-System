import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  getInventory, saveInventory,
  getRequests, updateRequestStatus,
  getReturns, updateReturnStatus
} from '../data/store'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('requests')
  const [inventory, setInventory] = useState([])
  const [requests, setRequests] = useState([])
  const [returns, setReturns] = useState([])
  const [newItem, setNewItem] = useState({ category: '', item: '', stock: '' })

  useEffect(() => { refresh() }, [])

  function refresh() {
    setInventory(getInventory())
    setRequests(getRequests())
    setReturns(getReturns())
  }

  function handleRequest(id, status) {
    updateRequestStatus(id, status)
    refresh()
  }

  function handleReturn(id, status) {
    updateReturnStatus(id, status)
    refresh()
  }

  function handleAddItem() {
    if (!newItem.category || !newItem.item || !newItem.stock) return
    const inv = getInventory()
    inv.push({ id: crypto.randomUUID(), ...newItem, stock: Number(newItem.stock) })
    saveInventory(inv)
    setNewItem({ category: '', item: '', stock: '' })
    refresh()
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const statusBadge = (s) => {
    if (s === 'approved') return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">อนุมัติ</span>
    if (s === 'rejected') return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">ปฏิเสธ</span>
    return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">รอดำเนินการ</span>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">👑 Admin Dashboard</h1>
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
          { key: 'requests', label: '📋 คำขอเบิก' },
          { key: 'returns',  label: '📦 คำขอคืน' },
          { key: 'inventory',label: '🗃️ จัดการคลัง' },
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

        {/* คำขอเบิก */}
        {tab === 'requests' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-lg mb-4">คำขอเบิกอุปกรณ์</h2>
            {requests.length === 0 && <p className="text-gray-400 text-sm">ไม่มีคำขอ</p>}
            <div className="space-y-3">
              {requests.map(r => (
                <div key={r.id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{r.item} <span className="text-gray-400 text-sm">x{r.qty}</span></p>
                    <p className="text-sm text-gray-500">JOB: {r.job_id} | โดย: {r.who}</p>
                    <p className="text-sm text-gray-500">เหตุผล: {r.reason}</p>
                    <div className="mt-1">{statusBadge(r.status)}</div>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleRequest(r.id, 'approved')}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg">
                        อนุมัติ
                      </button>
                      <button onClick={() => handleRequest(r.id, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded-lg">
                        ปฏิเสธ
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* คำขอคืน */}
        {tab === 'returns' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-lg mb-4">คำขอคืนอุปกรณ์</h2>
            {returns.length === 0 && <p className="text-gray-400 text-sm">ไม่มีคำขอคืน</p>}
            <div className="space-y-3">
              {returns.map(r => (
                <div key={r.id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{r.item} <span className="text-gray-400 text-sm">x{r.qty}</span></p>
                    <p className="text-sm text-gray-500">JOB: {r.job_id} | โดย: {r.who}</p>
                    <p className="text-sm text-gray-500">หมายเหตุ: {r.note || '-'}</p>
                    <div className="mt-1">{statusBadge(r.status)}</div>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleReturn(r.id, 'approved')}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg">
                        อนุมัติ
                      </button>
                      <button onClick={() => handleReturn(r.id, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded-lg">
                        ปฏิเสธ
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* จัดการคลัง */}
        {tab === 'inventory' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-lg mb-4">จัดการคลังอุปกรณ์</h2>

            {/* เพิ่มของ */}
            <div className="flex flex-wrap gap-2 mb-6">
              <input value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
                placeholder="หมวดหมู่" className="border rounded-xl px-3 py-2 text-sm flex-1 min-w-[120px]" />
              <input value={newItem.item} onChange={e => setNewItem({...newItem, item: e.target.value})}
                placeholder="ชื่อสินค้า" className="border rounded-xl px-3 py-2 text-sm flex-1 min-w-[120px]" />
              <input value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})}
                placeholder="จำนวน" type="number" className="border rounded-xl px-3 py-2 text-sm w-24" />
              <button onClick={handleAddItem}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl">
                + เพิ่ม
              </button>
            </div>

            {/* ตารางสินค้า */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="text-left px-4 py-2 rounded-l-lg">หมวดหมู่</th>
                    <th className="text-left px-4 py-2">สินค้า</th>
                    <th className="text-center px-4 py-2 rounded-r-lg">คงเหลือ</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(i => (
                    <tr key={i.id} className="border-t">
                      <td className="px-4 py-2 text-gray-500">{i.category}</td>
                      <td className="px-4 py-2 font-medium">{i.item}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`font-bold ${i.stock === 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {i.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}