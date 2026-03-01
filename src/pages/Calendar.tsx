import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { ChevronLeft, ChevronRight, Upload, CheckCircle2 } from 'lucide-react'
import type { Booking } from '@/mock/types'
import { cn, formatMAD, formatShortDate } from '@/lib/utils'
import { useBookingsContext } from '@/lib/useBookings'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const platformColors: Record<string, string> = {
    booking: 'bg-blue-500/20 border-blue-500/40 text-blue-800 dark:text-blue-300',
    airbnb: 'bg-rose-500/20 border-rose-500/40 text-rose-800 dark:text-rose-300',
    direct: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-800 dark:text-emerald-300',
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

function getStartDayOfWeek(year: number, month: number) {
    const d = new Date(year, month, 1).getDay()
    return d === 0 ? 6 : d - 1 // Monday = 0
}

export default function CalendarPage() {
    const { bookings } = useBookingsContext()
    const [year, setYear] = useState(new Date().getFullYear())
    const [month, setMonth] = useState(new Date().getMonth())
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [channels, setChannels] = useState({ booking: true, airbnb: true, direct: true })

    const daysInMonth = getDaysInMonth(year, month)
    const startDay = getStartDayOfWeek(year, month)
    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    const bookingsInMonth = useMemo(() => {
        return bookings.filter(b => {
            if (!channels[b.platform]) return false
            const ci = new Date(b.checkIn)
            const co = new Date(b.checkOut)
            const monthStart = new Date(year, month, 1)
            const monthEnd = new Date(year, month + 1, 0)
            return ci <= monthEnd && co >= monthStart
        })
    }, [bookings, year, month, channels])

    function getBookingsForDay(day: number): Booking[] {
        const date = new Date(year, month, day)
        return bookingsInMonth.filter(b => {
            const ci = new Date(b.checkIn)
            const co = new Date(b.checkOut)
            // Show booking if date is between checkIn (inclusive) and checkOut (exclusive)
            return date >= ci && date < co
        })
    }

    const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
    const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>

            {/* Controls */}
            <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
                        <span className="text-sm font-semibold w-36 text-center">{monthName}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {(['booking', 'airbnb', 'direct'] as const).map(p => (
                            <Button key={p} variant={channels[p] ? 'default' : 'outline'} size="sm" className="text-xs capitalize"
                                onClick={() => setChannels(c => ({ ...c, [p]: !c[p] }))}>
                                {p}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Calendar Grid */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
                        {WEEKDAYS.map(d => (
                            <div key={d} className="bg-muted/50 p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
                        ))}
                        {Array.from({ length: startDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-card min-h-[100px] sm:min-h-[120px] p-2" />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1
                            const dayBookings = getBookingsForDay(day)
                            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()

                            return (
                                <div key={day} className={cn("bg-card min-h-[100px] sm:min-h-[120px] p-2 transition-colors", isToday && "ring-2 ring-primary ring-inset")}>
                                    <span className={cn("text-xs font-medium", isToday && "text-primary font-bold")}>{day}</span>
                                    <div className="mt-1 space-y-1">
                                        {dayBookings.map(b => (
                                            <div
                                                key={b.id}
                                                onClick={() => setSelectedBooking(b)}
                                                className={cn("text-[10px] px-1.5 py-1 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity", platformColors[b.platform])}
                                            >
                                                {b.guestName.split(' ')[0]}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Booking Details Side Panel */}
            <Sheet open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    {selectedBooking && (
                        <>
                            <SheetHeader className="mb-6">
                                <div className="flex items-center justify-between">
                                    <SheetTitle className="text-xl">{selectedBooking.guestName}</SheetTitle>
                                    <Badge variant="outline" className="capitalize">{selectedBooking.platform}</Badge>
                                </div>
                                <SheetDescription>
                                    {formatShortDate(selectedBooking.checkIn)} → {formatShortDate(selectedBooking.checkOut)} ({selectedBooking.nights} nights)
                                </SheetDescription>
                            </SheetHeader>

                            <div className="space-y-8">
                                {/* Guest Info */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Guest Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground text-xs">Phone</p>
                                            <p className="font-medium">{selectedBooking.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Email</p>
                                            <p className="font-medium truncate">{selectedBooking.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Nationality</p>
                                            <p className="font-medium capitalize">{selectedBooking.nationality || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Guests</p>
                                            <p className="font-medium">{selectedBooking.guestsCount}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payout Info */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold">Financials</h3>
                                        <Badge variant={selectedBooking.payoutStatus === 'received' ? 'success' : 'warning'}>
                                            {selectedBooking.payoutStatus}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-xl border">
                                        <div>
                                            <p className="text-muted-foreground text-xs">Total Payout</p>
                                            <p className="font-semibold text-base">{formatMAD(selectedBooking.payoutAmount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Net Profit</p>
                                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatMAD(selectedBooking.profit)}</p>
                                        </div>
                                        {selectedBooking.payoutStatus === 'expected' && selectedBooking.expectedPayoutDate && (
                                            <div className="col-span-2 mt-2 pt-2 border-t">
                                                <p className="text-muted-foreground text-xs">Expected By</p>
                                                <p className="font-medium">{formatShortDate(selectedBooking.expectedPayoutDate)}</p>
                                            </div>
                                        )}
                                    </div>
                                    {selectedBooking.payoutStatus === 'expected' && (
                                        <Button variant="outline" className="w-full mt-3 gap-2 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
                                            <CheckCircle2 className="h-4 w-4" /> Mark as Received
                                        </Button>
                                    )}
                                </div>

                                {/* Placeholder Documents */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Documents (Morocco Compliance)</h3>
                                    <div className="border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                                            <Upload className="h-5 w-5" />
                                        </div>
                                        <p className="font-medium text-sm">Upload Guest ID / Passport</p>
                                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Click or drag files here to upload required compliance documents.</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
