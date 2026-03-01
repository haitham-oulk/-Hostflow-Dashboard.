export type Platform = 'booking' | 'airbnb' | 'direct'
export type PayoutStatus = 'expected' | 'received'
export type TaskType = 'cleaning' | 'key' | 'urgent'
export type TaskStatus = 'todo' | 'done'
export type BookingStatus = 'confirmed' | 'cancelled'

export interface Booking {
    id: string
    guestId: string
    guestName: string
    phone: string
    email: string
    nationality: string
    platform: Platform
    checkIn: string
    checkOut: string
    nights: number
    guestsCount: number
    payoutAmount: number
    profit: number
    payoutStatus: PayoutStatus
    expectedPayoutDate: string | null
    status: BookingStatus
}

export interface Guest {
    id: string
    fullName: string
    phone: string
    email: string
    nationality: string
    totalStays: number
    totalNights: number
    totalRevenue: number
    totalProfit: number
    lastStayDate: string
    reviews: string[]
    bookings: string[]
}

export interface Task {
    id: string
    type: TaskType
    title: string
    dueAt: string
    status: TaskStatus
    bookingId?: string
}

export interface Partner {
    id: string
    email: string
    status: 'active' | 'revoked'
    lastLogin: string
    permissions: {
        viewBookings: boolean
        editBookings: boolean
        viewFinance: boolean
        viewDocuments: boolean
        manageTasks: boolean
    }
}
