import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Booking, Guest, Task } from '@/mock/types'

const STORAGE_KEY_BOOKINGS = 'hostflow_bookings'
const STORAGE_KEY_GUESTS = 'hostflow_guests'
const STORAGE_KEY_TASKS = 'hostflow_tasks'

function loadBookings(): Booking[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_BOOKINGS)
        if (stored) return JSON.parse(stored) as Booking[]
    } catch { /* ignore */ }
    return []
}

function loadGuests(): Guest[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_GUESTS)
        if (stored) return JSON.parse(stored) as Guest[]
    } catch { /* ignore */ }
    return []
}

function loadTasks(): Task[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_TASKS)
        if (stored) return JSON.parse(stored) as Task[]
    } catch { /* ignore */ }
    return []
}

function saveBookings(bookings: Booking[]) {
    try { localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings)) } catch { /* */ }
}

function saveGuests(guests: Guest[]) {
    try { localStorage.setItem(STORAGE_KEY_GUESTS, JSON.stringify(guests)) } catch { /* */ }
}

function saveTasks(tasks: Task[]) {
    try { localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks)) } catch { /* */ }
}

interface BookingsContextValue {
    bookings: Booking[]
    guests: Guest[]
    tasks: Task[]
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
    importBookings: (newBookings: Booking[], newGuests: Guest[], newTasks: Task[]) => void
}

const BookingsContext = createContext<BookingsContextValue | null>(null)

export function BookingsProvider({ children }: { children: ReactNode }) {
    const [bookings, setBookings] = useState<Booking[]>(loadBookings)
    const [guests, setGuests] = useState<Guest[]>(loadGuests)
    const [tasks, setTasks] = useState<Task[]>(loadTasks)

    useEffect(() => { saveBookings(bookings) }, [bookings])
    useEffect(() => { saveGuests(guests) }, [guests])
    useEffect(() => { saveTasks(tasks) }, [tasks])

    const importBookings = useCallback((newBookings: Booking[], newGuests: Guest[], newTasks: Task[]) => {
        setBookings(prev => [...newBookings, ...prev])
        setGuests(newGuests) // full replacement — parser merges existing guests
        setTasks(prev => [...newTasks, ...prev])
    }, [])

    return (
        <BookingsContext.Provider value={{ bookings, guests, tasks, setTasks, importBookings }}>
            {children}
        </BookingsContext.Provider>
    )
}

export function useBookingsContext(): BookingsContextValue {
    const ctx = useContext(BookingsContext)
    if (!ctx) throw new Error('useBookingsContext must be used within a BookingsProvider')
    return ctx
}
