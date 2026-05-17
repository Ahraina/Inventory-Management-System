import { supabase } from '../utils/supabase'

export async function createBorrowRequest(payload) {
  const { data, error } = await supabase
    .from('borrow_requests')
    .insert([payload])
    .select()

  if (error) throw error

  return data
}

export async function getMyBorrowRequests() {
  const { data, error } = await supabase
    .from('borrow_requests')
    .select(`
      *,
      equipment (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getAllBorrowRequests() {
  const { data, error } = await supabase
    .from('borrow_requests')
    .select(`
        *,
        equipment (
          id,
          name,
          available_quantity
        ),
        profiles:user_id (
          full_name,
          email
        )
      `)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function updateBorrowRequestStatus(id, status) {
  const { data, error } = await supabase
    .from('borrow_requests')
    .update({ status })
    .eq('id', id)
    .select()

  console.log('update data:', data)
  console.log('update error:', error)

  if (error) throw error

  if (!data || data.length === 0) {
    throw new Error('Update ไม่โดนแถวใน borrow_requests')
  }

  return data
}

export async function getApprovedBorrowRequests() {
  const { data, error } = await supabase
    .from('borrow_requests')
    .select(`
      *,
      equipment (
        id,
        name,
        available_quantity
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function returnBorrowRequest(id) {
  const { data, error } = await supabase
    .from('borrow_requests')
    .update({
      status: 'returned',
      return_date: new Date().toISOString().split('T')[0]
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

export async function getMyApprovedBorrowRequests() {
  const { data, error } = await supabase
    .from('borrow_requests')
    .select(`
      *,
      equipment (
        id,
        name
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createReturnRequest(payload) {
  const { data, error } = await supabase
    .from('return_requests')
    .insert([payload])
    .select()

  if (error) throw error

  return data
}

export async function getAllReturnRequests() {
  const { data, error } = await supabase
    .from('return_requests')
    .select(`
      *,
      borrow_requests (
        id,
        job_id,
        quantity,
        equipment (
          id,
          name,
          available_quantity
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateReturnRequestStatus(id, status) {
  const { data, error } = await supabase
    .from('return_requests')
    .update({ status })
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

export async function getMyReturnRequests() {
  const { data, error } = await supabase
    .from('return_requests')
    .select('*')

  if (error) throw error

  return data
}

