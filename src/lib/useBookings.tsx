import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Booking, Guest, Task } from '@/mock/types'
import { supabase } from '@/lib/supabase'
import { calcCommissionPct, calcNetPayout, CLEANING_COST } from '@/lib/bookingUtils'

// ─── Supabase row → App Booking ──────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBooking(row: any): Booking {
    return {
        id: row.id,
        guestId: row.guest_id ?? '',
        guestName: row.hosted_names ?? '',
        phone: '',
        email: '',
        nationality: '',
        platform: row.platform,
        checkIn: row.check_in,
        checkOut: row.check_out,
        nights: row.nights ?? 0,
        guestsCount: row.num_guests ?? 1,
        payoutAmount: Number(row.net_payout_mad ?? 0),
        profit: Number(row.net_payout_mad ?? 0) - CLEANING_COST,
        payoutStatus: row.payout_status === 'paid' ? 'received' : 'expected',
        expectedPayoutDate: row.expected_payout_date ?? null,
        status: 'confirmed',
    }
}

// ─── New booking input ────────────────────────────────────────────────────────

export interface NewBookingInput {
    guestName: string
    platform: 'airbnb' | 'booking' | 'direct'
    checkIn: string
    checkOut: string
    grossPrice: number
    numGuests: number
}

function buildInsertPayload(input: NewBookingInput) {
    const commPct = calcCommissionPct(input.platform)
    const netPayout = calcNetPayout(input.grossPrice, commPct)
    return {
        hosted_names: input.guestName,
        platform: input.platform,
        check_in: input.checkIn,
        check_out: input.checkOut,
        gross_price_mad: input.grossPrice,
        platform_commission_pct: commPct,
        cleaning_fee_mad: CLEANING_COST,
        net_payout_mad: netPayout,
        num_guests: input.numGuests,
        payout_status: input.platform === 'direct' ? 'paid' : 'pending',
        source: 'manual',
    }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface BookingsContextValue {
    bookings: Booking[]
    guests: Guest[]
    tasks: Task[]
    loading: boolean
    error: string | null
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
    addBooking: (input: NewBookingInput) => Promise<void>
    updateBooking: (id: string, input: NewBookingInput) => Promise<void>
    deleteBooking: (id: string) => Promise<void>
    importBookings: (newBookings: Booking[], newGuests: Guest[], newTasks: Task[]) => void
}

const BookingsContext = createContext<BookingsContextValue | null>(null)

export function BookingsProvider({ children }: { children: ReactNode }) {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [guests] = useState<Guest[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // ── Fetch on mount ──────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false
        async function fetchBookings() {
            setLoading(true)
            setError(null)
            const { data, error: err } = await supabase
                .from('bookings')
                .select('*')
                .order('check_in', { ascending: false })

            if (cancelled) return
            if (err) {
                setError(err.message)
            } else {
                setBookings((data ?? []).map(rowToBooking))
            }
            setLoading(false)
        }
        fetchBookings()
        return () => { cancelled = true }
    }, [])

    // ── Add ─────────────────────────────────────────────────────────────────
    const addBooking = useCallback(async (input: NewBookingInput) => {
        const payload = buildInsertPayload(input)
        const { data, error: err } = await supabase
            .from('bookings')
            .insert(payload)
            .select()
            .single()

        if (err) throw new Error(err.message)
        setBookings(prev => [rowToBooking(data), ...prev])
    }, [])

    // ── Update ──────────────────────────────────────────────────────────────
    const updateBooking = useCallback(async (id: string, input: NewBookingInput) => {
        const payload = buildInsertPayload(input)
        const { data, error: err } = await supabase
            .from('bookings')
            .update(payload)
            .eq('id', id)
            .select()
            .single()

        if (err) throw new Error(err.message)
        setBookings(prev => prev.map(b => b.id === id ? rowToBooking(data) : b))
    }, [])

    // ── Delete ──────────────────────────────────────────────────────────────
    const deleteBooking = useCallback(async (id: string) => {
        const { error: err } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id)

        if (err) throw new Error(err.message)
        setBookings(prev => prev.filter(b => b.id !== id))
    }, [])

    // ── CSV bulk import (inserts each row) ───────────────────────────────────
    const importBookings = useCallback((newBookings: Booking[], _newGuests: Guest[], _newTasks: Task[]) => {
        // Optimistically add to local state; caller handles Supabase inserts
        setBookings(prev => [...newBookings, ...prev])
    }, [])

    return (
        <BookingsContext.Provider value={{
            bookings, guests, tasks, loading, error,
            setTasks, addBooking, updateBooking, deleteBooking, importBookings,
        }}>
            {children}
        </BookingsContext.Provider>
    )
}

export function useBookingsContext(): BookingsContextValue {
    const ctx = useContext(BookingsContext)
    if (!ctx) throw new Error('useBookingsContext must be used within a BookingsProvider')
    return ctx
}
