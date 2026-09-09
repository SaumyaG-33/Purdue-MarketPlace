import { createContext, useContext, useState } from 'react'

// Ephemeral, in-memory only — a booking selection survives the client-side
// login round-trip but is never persisted (matches the wireframe's "held pick
// expires after 20 min" note; there's nothing to expire if it's never stored).
const PendingBookingContext = createContext(null)

export function PendingBookingProvider({ children }) {
  const [pendingBooking, setPendingBooking] = useState(null)
  return (
    <PendingBookingContext.Provider value={{ pendingBooking, setPendingBooking }}>{children}</PendingBookingContext.Provider>
  )
}

export function usePendingBooking() {
  const ctx = useContext(PendingBookingContext)
  if (!ctx) throw new Error('usePendingBooking must be used inside PendingBookingProvider')
  return ctx
}
