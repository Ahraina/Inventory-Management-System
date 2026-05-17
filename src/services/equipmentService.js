import { supabase } from '../utils/supabase'

export async function getEquipment() {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('created_at', { ascending: false })

  console.log('supabase data:', data)
  console.log('supabase error:', error)

  if (error) throw error
  return data
}

export async function addEquipment(item) {
  console.log('send to supabase:', item)

  const { data, error } = await supabase
    .from('equipment')
    .insert([item])
    .select()

  console.log('add data:', data)
  console.log('add error:', error)

  if (error) throw error
  return data
}

export async function deleteEquipment(id) {
  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', id)

  if (error) throw error

  return true
}

export async function updateEquipmentStock(id, quantity) {
  const { data, error } = await supabase
    .from('equipment')
    .update({
      available_quantity: quantity
    })
    .eq('id', id)
    .select()

  if (error) throw error

  return data
}