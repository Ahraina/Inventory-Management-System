export default function Badge({ status }) {
  const s = (status || '').toLowerCase()
  if (s === 'approved') return (
    <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
      approved
    </span>
  )
  if (s === 'rejected') return (
    <span className="px-2 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200">
      rejected
    </span>
  )
  return (
    <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
      pending
    </span>
  )
}