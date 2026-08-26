import { Navigate, useParams } from 'react-router-dom'

/** Offers open inside the messages workspace (Karlancer-style). */
export function OfferDetailPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return <Navigate to="/app/messages" replace />
  return <Navigate to={`/app/messages/${id}`} replace />
}
