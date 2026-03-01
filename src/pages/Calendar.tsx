import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Loader2 } from 'lucide-react'
import { cn, formatMAD } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { AddBookingDialog } from '@/components/bookings/AddBookingDialog'

const WEEKDAYS_MINI = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const CATEGORY_COLORS = {
    reserved: { dot: 'bg-blue-500', bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-800' },
    guest_arrival: { dot: 'bg-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-800' },
    housekeeping: { dot: 'bg-purple-500', bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-800' },
    maintenance: { dot: 'bg-orange-500', bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-800' },
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Month')
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
    const [isAddBookingOpen, setIsAddBookingOpen] = useState(false)

    // Derived dates
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startDay = new Date(year, month, 1).getDay()

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.from('bookings').select('*')
            if (error) throw error
            setBookings(data || [])
        } catch (err) {
            console.error('Error fetching calendar bookings:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [])

    const prevPeriod = () => {
        if (view === 'Month') setCurrentDate(new Date(year, month - 1, 1))
        if (view === 'Week') setCurrentDate(new Date(year, month, currentDate.getDate() - 7))
        if (view === 'Day') setCurrentDate(new Date(year, month, currentDate.getDate() - 1))
    }
    const nextPeriod = () => {
        if (view === 'Month') setCurrentDate(new Date(year, month + 1, 1))
        if (view === 'Week') setCurrentDate(new Date(year, month, currentDate.getDate() + 7))
        if (view === 'Day') setCurrentDate(new Date(year, month, currentDate.getDate() + 1))
    }

    const handleBookingCreated = async () => {
        await fetchBookings()
        setIsAddBookingOpen(false)
    }

    // Process bookings into calendar events format
    const events = useMemo(() => {
        const list: any[] = []
        bookings.forEach(b => {
            const checkInD = new Date(b.check_in)
            const checkOutD = new Date(b.check_out)

            // 1. Guest Arrival
            if (checkInD.getFullYear() === year && checkInD.getMonth() === month) {
                list.push({
                    id: `${b.id}-in`,
                    bookingId: b.id,
                    day: checkInD.getDate(),
                    title: `Arrival: ${b.hosted_names || 'Guest'}`,
                    type: 'guest_arrival',
                    time: '15:00',
                    raw: b
                })
            }
            // 2. Housekeeping
            if (checkOutD.getFullYear() === year && checkOutD.getMonth() === month) {
                list.push({
                    id: `${b.id}-out`,
                    bookingId: b.id,
                    day: checkOutD.getDate(),
                    title: `Housekeeping: ${b.hosted_names || 'Guest'}`,
                    type: 'housekeeping',
                    time: '11:00',
                    raw: b
                })
            }
            // 3. Reserved
            for (let i = 1; i <= (b.nights || 1); i++) {
                const stayDate = new Date(checkInD)
                stayDate.setDate(checkInD.getDate() + i)
                if (stayDate.getFullYear() === year && stayDate.getMonth() === month && stayDate < checkOutD) {
                    list.push({
                        id: `${b.id}-stay-${i}`,
                        bookingId: b.id,
                        day: stayDate.getDate(),
                        title: `Stay: ${b.hosted_names || 'Guest'}`,
                        type: 'reserved',
                        time: 'All Day',
                        raw: b
                    })
                }
            }
        })
        return list
    }, [bookings, year, month])

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-heading font-bold tracking-tight text-slate-900">Calendar</h1>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Left Panel */}
                <div className="w-[280px] shrink-0 space-y-8 overflow-y-auto pb-4 pr-1">
                    {/* Mini Calendar */}
                    <Card className="border-slate-200/60 shadow-sm bg-white p-5 rounded-2xl transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-900" onClick={prevPeriod}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-semibold text-slate-800">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-900" onClick={nextPeriod}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-7 gap-y-2 mb-2">
                            {WEEKDAYS_MINI.map((d, i) => (
                                <div key={i} className="text-center text-[11px] font-medium text-slate-400">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-1">
                            {Array.from({ length: startDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-8" />
                            ))}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const day = i + 1
                                const isSelected = day === currentDate.getDate()
                                return (
                                    <div key={day} className="flex justify-center">
                                        <button
                                            onClick={() => setCurrentDate(new Date(year, month, day))}
                                            className={cn(
                                                "h-7 w-7 rounded-full text-xs font-medium flex items-center justify-center transition-colors",
                                                isSelected
                                                    ? "bg-slate-900 text-white shadow-sm"
                                                    : "text-slate-600 hover:bg-slate-100"
                                            )}>
                                            {day}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>

                    {/* Category Legend */}
                    <div className="px-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-sm text-slate-800">Category</h3>
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400">
                                <span className="text-lg leading-none -mt-2">...</span>
                            </Button>
                        </div>
                        <div className="space-y-3.5">
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="h-2 w-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Reserved</span>
                            </div>
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Guest Arrival</span>
                            </div>
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="h-2 w-2 rounded-full bg-purple-500 group-hover:scale-125 transition-transform" />
                                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Housekeeping</span>
                            </div>
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="h-2 w-2 rounded-full bg-orange-500 group-hover:scale-125 transition-transform" />
                                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Maintenance</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Calendar Grid */}
                <Card className="flex-1 flex flex-col border-slate-200/60 shadow-sm overflow-hidden bg-white rounded-2xl relative transition-all duration-300 hover:shadow-md">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    )}

                    {/* Calendar Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-heading font-semibold text-slate-800">Schedule</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-slate-100/80 rounded-lg p-1">
                                {['Day', 'Week', 'Month'].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v as any)}
                                        className={cn(
                                            "px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
                                            view === v ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                        )}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" className="h-[34px] text-xs font-medium border-slate-200 text-slate-600 gap-2 hover:bg-slate-50">
                                All Category <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                            <Button
                                onClick={() => setIsAddBookingOpen(true)}
                                size="sm"
                                className="h-[34px] font-heading text-xs font-semibold bg-[#c2f34e] hover:bg-[#b0e23d] text-slate-900 gap-1.5 shadow-sm transition-transform active:scale-95"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Schedule
                            </Button>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-auto bg-slate-50/30">
                        {view === 'Month' && (
                            <div className="grid grid-cols-7 min-w-[800px] h-full">
                                {/* Weekday headers */}
                                {WEEKDAYS_FULL.map(d => (
                                    <div key={d} className="border-b border-r border-slate-100 py-3 text-center bg-white sticky top-0 z-10 shadow-sm">
                                        <span className="text-xs font-semibold text-slate-500">{d}</span>
                                    </div>
                                ))}

                                {/* Empty start days */}
                                {Array.from({ length: startDay }).map((_, i) => (
                                    <div key={`empty-main-${i}`} className="border-b border-r border-slate-100 bg-slate-50/50 min-h-[120px]" />
                                ))}

                                {/* Days */}
                                {Array.from({ length: daysInMonth }, (_, i) => {
                                    const day = i + 1
                                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                                    const dayEvents = events.filter(e => e.day === day)

                                    return (
                                        <div key={day} className={cn(
                                            "border-b border-r border-slate-100 min-h-[120px] relative group transition-colors duration-200",
                                            isToday ? "bg-blue-50/10" : "bg-white hover:bg-slate-50/50"
                                        )}>
                                            <div className="p-1.5 flex justify-between items-center">
                                                <span className={cn(
                                                    "inline-flex h-6 min-w-[24px] items-center justify-center rounded-full text-[13px] font-medium px-1 cursor-pointer transition-colors",
                                                    isToday ? "bg-blue-500 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                                                )}
                                                    onClick={() => {
                                                        setCurrentDate(new Date(year, month, day))
                                                        setView('Day')
                                                    }}>
                                                    {day}
                                                </span>
                                                {dayEvents.length > 0 && (
                                                    <span className="text-[10px] text-slate-400 font-medium mr-1">{dayEvents.length}</span>
                                                )}
                                            </div>

                                            <div className="space-y-1.5 mt-0.5 px-1.5 overflow-y-auto max-h-[110px] custom-scrollbar pb-1">
                                                {dayEvents.map(event => {
                                                    const colors = CATEGORY_COLORS[event.type as keyof typeof CATEGORY_COLORS]
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            onClick={() => setSelectedBooking(event.raw)}
                                                            className={cn(
                                                                "px-2 py-1.5 rounded-md border text-left cursor-pointer transition-all duration-200 hover:brightness-95 hover:shadow-sm hover:scale-[1.02]",
                                                                colors.bg, colors.border
                                                            )}
                                                        >
                                                            <p className={cn("text-[10px] font-medium opacity-80 mb-0.5", colors.text)}>{event.time}</p>
                                                            <p className={cn("text-[11px] font-semibold leading-tight line-clamp-2", colors.text)}>{event.title}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {view === 'Week' && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center max-w-sm">
                                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center mb-3 text-slate-400">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Vue Semaine</h3>
                                    <p className="text-sm text-slate-500">Cette vue demande un peu plus de développement et sera disponible dans la version finale (MVP v1.1).</p>
                                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setView('Month')}>Retour au Mois</Button>
                                </div>
                            </div>
                        )}
                        {view === 'Day' && (
                            <div className="flex flex-col h-full bg-white">
                                <div className="border-b border-slate-100 py-3 px-6 bg-slate-50/50 sticky top-0 z-10 flex items-center gap-3">
                                    <span className="text-2xl font-bold text-slate-800">{currentDate.getDate()}</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                                            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                        </span>
                                        <span className="text-[11px] text-slate-500">
                                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 overflow-y-auto">
                                    {(() => {
                                        const dayEvents = events.filter(e => e.day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear())
                                        if (dayEvents.length === 0) {
                                            return (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                                    <p className="text-sm font-medium">Aucun événement pour ce jour.</p>
                                                </div>
                                            )
                                        }
                                        return (
                                            <div className="space-y-3 max-w-2xl">
                                                {dayEvents.map(event => {
                                                    const colors = CATEGORY_COLORS[event.type as keyof typeof CATEGORY_COLORS]
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            onClick={() => setSelectedBooking(event.raw)}
                                                            className={cn(
                                                                "p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] flex items-start gap-4",
                                                                colors.bg, colors.border
                                                            )}
                                                        >
                                                            <div className={cn("w-1.5 h-full rounded-full self-stretch min-h-[40px]", colors.dot)} />
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <p className={cn("text-sm font-bold", colors.text)}>{event.title}</p>
                                                                    <p className={cn("text-xs font-semibold opacity-80", colors.text)}>{event.time}</p>
                                                                </div>
                                                                <p className={cn("text-xs font-medium opacity-80 capitalize", colors.text)}>{event.type.replace('_', ' ')}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Modals & Sheets */}
            <AddBookingDialog
                open={isAddBookingOpen}
                onOpenChange={setIsAddBookingOpen}
                onBookingCreated={handleBookingCreated}
            />

            <Sheet open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto border-l-slate-200 shadow-2xl">
                    {selectedBooking && (
                        <>
                            <SheetHeader className="mb-6">
                                <div className="flex items-center justify-between">
                                    <SheetTitle className="text-xl font-heading font-bold text-slate-900">{selectedBooking.hosted_names || 'Guest'}</SheetTitle>
                                    <Badge variant="outline" className={cn(
                                        "capitalize px-3 py-1 text-xs font-semibold shadow-sm",
                                        selectedBooking.platform?.toLowerCase() === 'airbnb' ? "bg-rose-50 text-rose-600 border-rose-200" :
                                            selectedBooking.platform?.toLowerCase() === 'booking' ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    )}>
                                        {selectedBooking.platform}
                                    </Badge>
                                </div>
                                <SheetDescription className="text-slate-500 font-medium">
                                    {new Date(selectedBooking.check_in).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} → {new Date(selectedBooking.check_out).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} ({selectedBooking.nights} nuits)
                                </SheetDescription>
                            </SheetHeader>

                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* Guest Info */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3 text-slate-800 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                        Information Voyageur
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div>
                                            <p className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold mb-1">Téléphone</p>
                                            <p className="font-medium text-slate-800">{selectedBooking.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold mb-1">Email</p>
                                            <p className="font-medium truncate text-slate-800">{selectedBooking.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold mb-1">Nationalité</p>
                                            <p className="font-medium capitalize text-slate-800">{selectedBooking.nationality || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold mb-1">Voyageurs</p>
                                            <p className="font-medium text-slate-800">{selectedBooking.number_of_guest || 1} personne(s)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Info */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            Détails Financiers
                                        </h3>
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                                            selectedBooking.payout_status === 'paid' ? "bg-emerald-100 text-emerald-700" :
                                                selectedBooking.payout_status === 'pending' ? "bg-amber-100 text-amber-700" :
                                                    "bg-blue-100 text-blue-700"
                                        )}>
                                            {selectedBooking.payout_status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                                        <div>
                                            <p className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold mb-1">Montant Brut</p>
                                            <p className="font-heading font-semibold text-base text-slate-800">{formatMAD(selectedBooking.total_amount_mad || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold mb-1">Net à percevoir</p>
                                            <p className="font-heading font-bold text-lg text-emerald-600">{formatMAD(selectedBooking.net_payout_mad || 0)}</p>
                                            <p className="text-[10px] text-emerald-600/70 font-medium">Commissions déduites</p>
                                        </div>
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
