import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Upload, User, CalendarDays, Clock, CreditCard, MapPin, Building2, Globe, X, BadgeCheck, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/* ── Types ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BookingRow = Record<string, any>

function formatMAD(value: number) {
    return new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 0 }).format(value) + ' MAD'
}

function formatDate(iso: string | null | undefined) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function PlatformIcon({ platform }: { platform: string }) {
    const p = (platform || '').toLowerCase()
    if (p.includes('airbnb')) return <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-400" /><span className="capitalize text-xs">{platform}</span></div>
    if (p.includes('booking')) return <div className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-blue-400" /><span className="capitalize text-xs">{platform}</span></div>
    return <div className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-emerald-400" /><span className="capitalize text-xs">{platform || 'Direct'}</span></div>
}

function StatusPill({ status }: { status: string }) {
    const s = (status || '').toLowerCase()
    const isPaid = s === 'paid' || s === 'payé'
    return (
        <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
            isPaid ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
        )}>
            {isPaid ? <BadgeCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {isPaid ? 'Payé' : 'En attente'}
        </span>
    )
}

/* ── Guest Card ── */
function GuestCard({ guest, bookings, onClick }: {
    guest: { id: string; full_name: string; email?: string; phone?: string; nationality?: string }
    bookings: BookingRow[]
    onClick: () => void
}) {
    const totalNights = bookings.reduce((s, b) => s + Number(b.nights ?? 0), 0)
    const totalRevenue = bookings.reduce((s, b) => s + Number(b.net_payout_mad ?? 0), 0)
    const lastBooking = bookings[0]
    const name = guest.full_name || '—'

    return (
        <button
            onClick={onClick}
            className="group w-full text-left rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {getInitials(name)}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{guest.email || guest.phone || guest.nationality || 'Aucune info'}</p>
                </div>
                {/* Stats */}
                <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{bookings.length} rés.</p>
                    <p className="text-xs text-slate-400">{totalNights} nuits</p>
                </div>
            </div>

            {/* Bottom strip */}
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CreditCard className="h-3.5 w-3.5" />
                    {formatMAD(totalRevenue)} total
                </div>
                {lastBooking && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        Dernier séjour : {formatDate(lastBooking.check_out)}
                    </div>
                )}
            </div>
        </button>
    )
}

/* ── Guest Detail Drawer ── */
function GuestDetail({
    guest, bookings, onClose,
}: {
    guest: { id: string; full_name: string; email?: string; phone?: string; nationality?: string }
    bookings: BookingRow[]
    onClose: () => void
}) {
    const name = guest.full_name || '—'
    const totalRevenue = bookings.reduce((s, b) => s + Number(b.net_payout_mad ?? 0), 0)

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            {/* Panel */}
            <div className="relative w-full max-w-[480px] bg-white h-full shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-start gap-4 p-6 border-b border-slate-100">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white text-lg font-bold shrink-0">
                        {getInitials(name)}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900">{name}</h2>
                        <p className="text-sm text-slate-400">{guest.nationality || 'Nationalité inconnue'}</p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-7">
                    {/* Contact */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Informations</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Email', value: guest.email },
                                { label: 'Téléphone', value: guest.phone },
                                { label: 'Nationalité', value: guest.nationality },
                                { label: 'Séjours', value: String(bookings.length) },
                            ].map(item => (
                                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-[11px] text-slate-400 mb-0.5">{item.label}</p>
                                    <p className="text-sm font-medium text-slate-800 truncate">{item.value || '—'}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Financial summary */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Récapitulatif financier</h3>
                        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-rose-400 font-medium">Total encaissé</p>
                                <p className="text-2xl font-bold text-rose-600">{formatMAD(totalRevenue)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Nuits totales</p>
                                <p className="text-2xl font-bold text-slate-700">
                                    {bookings.reduce((s, b) => s + Number(b.nights ?? 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Booking history */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Historique des réservations</h3>
                        <div className="space-y-3">
                            {bookings.length === 0 ? (
                                <p className="text-sm text-slate-400">Aucune réservation.</p>
                            ) : bookings.map(b => (
                                <div key={b.id} className="rounded-xl border border-slate-100 bg-white p-4 flex items-center justify-between gap-3 shadow-sm">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <PlatformIcon platform={b.platform} />
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <CalendarDays className="h-3 w-3" />
                                            {formatDate(b.check_in)} → {formatDate(b.check_out)}
                                            {b.nights ? ` (${b.nights} nuits)` : ''}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-slate-900 text-sm">{formatMAD(Number(b.net_payout_mad ?? 0))}</p>
                                        <div className="mt-1">
                                            <StatusPill status={b.payout_status} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Document upload */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Documents d'identité</h3>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 transition-colors cursor-pointer">
                            <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                                <Upload className="h-5 w-5 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-600">Déposer CIN / Passeport</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Glissez un fichier ici ou cliquez pour uploader (PDF, JPG, PNG)</p>
                            <Badge variant="outline" className="mt-3 text-xs text-slate-400">Conformité Maroc</Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── Main Page ── */
export default function Guests() {
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [guests, setGuests] = useState<{ id: string; full_name: string; email?: string; phone?: string; nationality?: string }[]>([])
    const [bookingsByGuest, setBookingsByGuest] = useState<Record<string, BookingRow[]>>({})
    const [selected, setSelected] = useState<typeof guests[0] | null>(null)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const { data: gData } = await supabase.from('guests').select('*').order('full_name')
            const { data: bData } = await supabase.from('bookings').select('*').order('check_in', { ascending: false })

            const guestList = gData ?? []
            const bookingList = bData ?? []

            // Group bookings by guest_id
            const grouped: Record<string, BookingRow[]> = {}
            bookingList.forEach(b => {
                const gid = b.guest_id
                if (!grouped[gid]) grouped[gid] = []
                grouped[gid].push(b)
            })

            // Also handle bookings with no guest: create synthetic guest from hosted_names
            const noGuestBookings = bookingList.filter(b => !b.guest_id && b.hosted_names)
            const synthetic: typeof guestList = []
            const syntheticMap: Record<string, BookingRow[]> = {}
            const seen = new Set<string>()
            noGuestBookings.forEach(b => {
                const name = b.hosted_names
                if (!seen.has(name)) {
                    seen.add(name)
                    const sid = 'synthetic_' + name
                    synthetic.push({ id: sid, full_name: name })
                    syntheticMap[sid] = []
                }
                const sid = 'synthetic_' + name
                syntheticMap[sid].push(b)
            })

            setGuests([...guestList, ...synthetic])
            setBookingsByGuest({ ...grouped, ...syntheticMap })
            setLoading(false)
        }
        fetchData()
    }, [])

    const filtered = guests.filter(g =>
        !search || g.full_name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clients</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Profils complets avec historique et documents.</p>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Rechercher un client…"
                        className="pl-9 rounded-xl border-slate-200"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats bar */}
            {!loading && (
                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span><span className="font-semibold text-slate-900">{guests.length}</span> clients</span>
                    <span>·</span>
                    <span><span className="font-semibold text-slate-900">{Object.values(bookingsByGuest).reduce((s, b) => s + b.length, 0)}</span> réservations</span>
                </div>
            )}

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 animate-pulse space-y-4">
                            <div className="flex gap-3">
                                <div className="h-11 w-11 bg-slate-100 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="h-px bg-slate-50" />
                            <div className="h-3 bg-slate-50 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <User className="h-12 w-12 mb-3" />
                    <p className="text-sm font-medium">Aucun client trouvé</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(g => (
                        <GuestCard
                            key={g.id}
                            guest={g}
                            bookings={bookingsByGuest[g.id] ?? []}
                            onClick={() => setSelected(g)}
                        />
                    ))}
                </div>
            )}

            {/* Detail panel */}
            {selected && (
                <GuestDetail
                    guest={selected}
                    bookings={bookingsByGuest[selected.id] ?? []}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    )
}
