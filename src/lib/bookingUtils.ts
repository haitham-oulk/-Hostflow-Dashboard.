import type { Booking, Guest, Platform, Task } from '@/mock/types'

const CLEANING_COST = 200

let counter = Date.now()
function uuid(): string {
    counter++
    return `${counter}-${Math.random().toString(36).slice(2, 9)}`
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
    const diff = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(diff, 0)
}

/**
 * Parse DD/MM/YYYY string to Date.
 */
export function parseDDMMYYYY(dateString: string): Date | null {
    const parts = dateString.trim().split('/')
    if (parts.length !== 3) return null
    const [day, month, year] = parts
    const d = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
    if (isNaN(d.getTime())) return null
    return d
}

function getNextThursday(d: Date): Date {
    const result = new Date(d)
    const day = result.getDay()
    const daysUntil = (4 - day + 7) % 7 || 7
    result.setDate(result.getDate() + daysUntil)
    return result
}

function normalizePlatform(raw: string): Platform {
    const lower = raw.toLowerCase().trim()
    if (lower.includes('booking')) return 'booking'
    if (lower.includes('airbnb')) return 'airbnb'
    return 'direct'
}

function derivePayoutInfo(platform: Platform, checkOut: Date): { payoutStatus: 'expected' | 'received'; expectedPayoutDate: string | null } {
    if (platform === 'direct') return { payoutStatus: 'received', expectedPayoutDate: null }
    if (platform === 'booking') {
        return { payoutStatus: 'expected', expectedPayoutDate: getNextThursday(checkOut).toISOString().slice(0, 10) }
    }
    // airbnb: checkout + 1 day
    const next = new Date(checkOut)
    next.setDate(next.getDate() + 1)
    return { payoutStatus: 'expected', expectedPayoutDate: next.toISOString().slice(0, 10) }
}

// ─── CSV Parsing ──────────────────────────────────────────────────────

const REQUIRED_CSV = ['hosted names', 'number of guest', 'platforme booked', 'check-in', 'check-out', 'net'] as const

const SKIP_IF_MISSING = ['hosted names', 'check-in', 'check-out', 'net'] as const

export interface CsvParseResult {
    bookings: Booking[]
    guests: Guest[]
    tasks: Task[]
    importedCount: number
    skippedCount: number
    errors: string[]
}

export function parseBookingsCsv(csvText: string, existingGuests: Guest[] = []): CsvParseResult {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0)

    if (lines.length < 2) {
        return { bookings: [], guests: [], tasks: [], importedCount: 0, skippedCount: 0, errors: ['CSV file is empty or has no data rows.'] }
    }

    // Find header row (case insensitive)
    let headerIndex = -1
    let headerMap: Record<string, number> = {}

    for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
        const lowerCols = cols.map(c => c.toLowerCase())
        const allFound = REQUIRED_CSV.every(req => lowerCols.includes(req))
        if (allFound) {
            headerIndex = i
            lowerCols.forEach((col, idx) => { headerMap[col] = idx })
            break
        }
    }

    if (headerIndex === -1) {
        return {
            bookings: [], guests: [], tasks: [], importedCount: 0, skippedCount: 0,
            errors: ['Invalid CSV format. Please use required structure.']
        }
    }

    const bookings: Booking[] = []
    const tasks: Task[] = []
    const guestMap = new Map<string, Guest>()

    // Seed existing guests into the map
    existingGuests.forEach(g => {
        const key = `${g.fullName.trim().toLowerCase()}|${g.phone.trim()}|${g.email.trim().toLowerCase()}`
        guestMap.set(key, { ...g })
    })

    let skippedCount = 0

    for (let i = headerIndex + 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))

        const get = (col: string) => values[headerMap[col]] ?? ''

        const rawName = get('hosted names')
        const rawPhone = get('phone')
        const rawEmail = get('email')
        const rawNationality = get('nationality')
        const rawGuests = get('number of guest')
        const rawPlatform = get('platforme booked')
        const rawCheckIn = get('check-in')
        const rawCheckOut = get('check-out')
        const rawNet = get('net')

        // Missing critical dates or money skips row
        if (!rawName || !rawCheckIn || !rawCheckOut || !rawNet) {
            skippedCount++
            continue
        }

        const checkInDate = parseDDMMYYYY(rawCheckIn)
        if (!checkInDate) { skippedCount++; continue }

        const checkOutDate = parseDDMMYYYY(rawCheckOut)
        if (!checkOutDate) { skippedCount++; continue }

        const payoutAmount = parseFloat(rawNet.replace(/,/g, ''))
        if (isNaN(payoutAmount)) { skippedCount++; continue }

        const platform = normalizePlatform(rawPlatform || 'direct')
        const nights = calculateNights(checkInDate, checkOutDate)
        const guestsCount = parseInt(rawGuests, 10) || 1
        const { payoutStatus, expectedPayoutDate } = derivePayoutInfo(platform, checkOutDate)
        const profit = payoutAmount - CLEANING_COST

        const bookingId = uuid()

        // Normalize guest fields
        const fullName = rawName.trim()
        const phone = rawPhone.trim()
        const email = rawEmail.trim()
        const nationality = rawNationality.trim()
        const guestKey = `${fullName.toLowerCase()}|${phone}|${email.toLowerCase()}`

        // Guest matching
        const existingGuest = guestMap.get(guestKey)
        let guestId: string

        if (existingGuest) {
            existingGuest.totalStays += 1
            existingGuest.totalNights += nights
            existingGuest.totalRevenue += payoutAmount
            existingGuest.totalProfit += profit
            existingGuest.lastStayDate = checkOutDate.toISOString().slice(0, 10)
            existingGuest.bookings.push(bookingId)
            guestId = existingGuest.id
        } else {
            guestId = uuid()
            const newGuest: Guest = {
                id: guestId,
                fullName,
                phone,
                email,
                nationality,
                totalStays: 1,
                totalNights: nights,
                totalRevenue: payoutAmount,
                totalProfit: profit,
                lastStayDate: checkOutDate.toISOString().slice(0, 10),
                reviews: [],
                bookings: [bookingId],
            }
            guestMap.set(guestKey, newGuest)
        }

        const booking: Booking = {
            id: bookingId,
            guestId,
            guestName: fullName,
            phone,
            email,
            nationality,
            platform,
            checkIn: checkInDate.toISOString().slice(0, 10),
            checkOut: checkOutDate.toISOString().slice(0, 10),
            nights,
            guestsCount,
            payoutAmount,
            profit,
            payoutStatus,
            expectedPayoutDate,
            status: 'confirmed',
        }

        bookings.push(booking)

        // Generate cleaning task automatically for checkOut day
        const cleaningTask: Task = {
            id: uuid(),
            type: 'cleaning',
            title: `Cleaning: ${fullName}`,
            dueAt: checkOutDate.toISOString().slice(0, 10),
            status: 'todo',
            bookingId: booking.id,
        }
        tasks.push(cleaningTask)
    }

    return {
        bookings,
        guests: [...guestMap.values()],
        tasks,
        importedCount: bookings.length,
        skippedCount,
        errors: [],
    }
}
