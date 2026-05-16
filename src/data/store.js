// จำลอง Database ด้วย localStorage

const KEYS = {
  users: 'inv_users',
  inventory: 'inv_inventory',
  requests: 'inv_requests',
  returns: 'inv_returns',
}

// ── Seed ข้อมูลเริ่มต้น ──
export function seedData() {
  if (!localStorage.getItem(KEYS.users)) {
    localStorage.setItem(KEYS.users, JSON.stringify([
      { id: '1', email: 'admin@demo.com', password: 'admin1234', name: 'Admin', role: 'admin' },
      { id: '2', email: 'user@demo.com',  password: 'user1234',  name: 'สมชาย', role: 'user' },
    ]))
  }
  if (!localStorage.getItem(KEYS.inventory)) {
    localStorage.setItem(KEYS.inventory, JSON.stringify([
      { id: '1', category: 'อุปกรณ์คอมพิวเตอร์', item: 'เมาส์',        stock: 10 },
      { id: '2', category: 'อุปกรณ์คอมพิวเตอร์', item: 'คีย์บอร์ด',    stock: 8  },
      { id: '3', category: 'อุปกรณ์คอมพิวเตอร์', item: 'สายชาร์จ USB', stock: 15 },
      { id: '4', category: 'เครื่องเขียน',        item: 'ปากกา',        stock: 50 },
      { id: '5', category: 'เครื่องเขียน',        item: 'กระดาษ A4',    stock: 20 },
    ]))
  }
  if (!localStorage.getItem(KEYS.requests)) {
    localStorage.setItem(KEYS.requests, JSON.stringify([]))
  }
  if (!localStorage.getItem(KEYS.returns)) {
    localStorage.setItem(KEYS.returns, JSON.stringify([]))
  }
}

// ── Users ──
export const getUsers = () => JSON.parse(localStorage.getItem(KEYS.users) || '[]')
export const findUser = (email, password) => {
  const users = getUsers()
  return users.find(
    u => u.email.toLowerCase() === email.toLowerCase().trim() &&
    u.password === password
  )
}

// ── Inventory ──
export const getInventory = () => JSON.parse(localStorage.getItem(KEYS.inventory) || '[]')
export const saveInventory = (data) => localStorage.setItem(KEYS.inventory, JSON.stringify(data))

export function adjustStock(itemName, delta) {
  const inv = getInventory()
  const idx = inv.findIndex(i => i.item === itemName)
  if (idx !== -1) {
    inv[idx].stock = Math.max(0, inv[idx].stock + delta)
    saveInventory(inv)
  }
}

// ── Requests ──
export const getRequests = () => JSON.parse(localStorage.getItem(KEYS.requests) || '[]')
export const saveRequests = (data) => localStorage.setItem(KEYS.requests, JSON.stringify(data))

export function addRequest(jobId, rows, email) {
  const reqs = getRequests()
  const now = new Date().toISOString()
  rows.forEach(r => {
    reqs.push({
      id: crypto.randomUUID(),
      job_id: jobId,
      item: r.item,
      qty: r.qty,
      reason: r.reason,
      status: 'pending',
      admin_note: '',
      when: now,
      who: email,
    })
  })
  saveRequests(reqs)
}

export function updateRequestStatus(id, status, adminNote = '') {
  const reqs = getRequests()
  const idx = reqs.findIndex(r => r.id === id)
  if (idx === -1) return
  const prev = reqs[idx].status
  if (status === 'approved' && prev !== 'approved') adjustStock(reqs[idx].item, -reqs[idx].qty)
  if (prev === 'approved' && status !== 'approved') adjustStock(reqs[idx].item, +reqs[idx].qty)
  reqs[idx].status = status
  reqs[idx].admin_note = adminNote
  saveRequests(reqs)
}

// ── Returns ──
export const getReturns = () => JSON.parse(localStorage.getItem(KEYS.returns) || '[]')
export const saveReturns = (data) => localStorage.setItem(KEYS.returns, JSON.stringify(data))

export function addReturn(jobId, item, qty, note, email) {
  const rets = getReturns()
  rets.push({
    id: crypto.randomUUID(),
    job_id: jobId,
    item, qty, note,
    who: email,
    status: 'pending',
    admin_note: '',
    when: new Date().toISOString(),
  })
  saveReturns(rets)
}

export function updateReturnStatus(id, status, adminNote = '') {
  const rets = getReturns()
  const idx = rets.findIndex(r => r.id === id)
  if (idx === -1) return
  const prev = rets[idx].status
  if (status === 'approved' && prev !== 'approved') adjustStock(rets[idx].item, +rets[idx].qty)
  if (prev === 'approved' && status !== 'approved') adjustStock(rets[idx].item, -rets[idx].qty)
  rets[idx].status = status
  rets[idx].admin_note = adminNote
  saveReturns(rets)
}