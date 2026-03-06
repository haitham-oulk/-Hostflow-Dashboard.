import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
    TrendingUp, DollarSign, CalendarCheck, Clock, Wallet, Building2,
    ChevronDown, Users, Plus, CalendarDays, BedDouble, Globe
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatMAD, formatDateShort, getSourceColor, getStatusBadge, cn } from '@/lib/utils'

const periods = [
    { label: 'Juillet 2025', start: '2025-07-01', end: '2025-07-31', days: 31 },
    { label: 'Août 2025', start: '2025-08-01', end: '2025-08-31', days: 31 },
    { label: 'Septembre 2025', start: '2025-09-01', end: '2025-09-30', days: 30 },
    { label: 'Octobre 2025', start: '2025-10-01', end: '2025-10-31', days: 31 },
    { label: 'Novembre 2025', start: '2025-11-01', end: '2025-11-30', days: 30 },
    { label: 'Décembre 2025', start: '2025-12-01', end: '2025-12-31', days: 31 },
    { label: 'Janvier 2026', start: '2026-01-01', end: '2026-01-31', days: 31 },
    { label: 'Février 2026', start: '2026-02-01', end: '2026-02-28', days: 28 },
    { label: 'Mars 2026', start: '2026-03-01', end: '2026-03-31', days: 31 },
    { label: 'S2 2025', start: '2025-07-01', end: '2025-12-31', days: 184 },
    { label: 'Année 2025', start: '2025-01-01', end: '2025-12-31', days: 365 },
    { label: 'Année 2026', start: '2026-01-01', end: '2026-12-31', days: 366 },
    { label: 'Tout', start: '2020-01-01', end: '2030-12-31', days: 999 },
]

export default function Dashboard() {
    const { bookings, properties, tasks, loading } = useStore()
    const [period, setPeriod] = useState(periods[periods.length - 1])
    const [periodOpen, setPeriodOpen] = useState(false)

    /* ── Filtered bookings ── */
    const pBookings = useMemo(() =>
        bookings.filter(b => b.checkIn >= period.start && b.checkIn <= period.end && b.status !== 'cancelled'),
        [bookings, period])

    /* ── KPIs ── */
    const revenue = pBookings.reduce((s, b) => s + b.totalAmount, 0)
    const net = pBookings.reduce((s, b) => s + b.netAmount, 0)
    const fees = pBookings.reduce((s, b) => s + b.platformFees, 0)
    const bookedNights = pBookings.reduce((s, b) => s + b.nights, 0)
    const activeProps = properties.filter(p => p.status === 'active').length
    const availableNights = activeProps * period.days
    const occupancy = availableNights > 0 ? Math.min(100, Math.round((bookedNights / availableNights) * 100)) : 0
    const activeBookings = pBookings.filter(b => b.status === 'confirmed').length
    const pendingBookings = pBookings.filter(b => b.status === 'pending').length

    /* ── Pending payouts ── */
    const pendingPayouts = bookings.filter(b =>
        (b.paymentStatus === 'pending' || b.paymentStatus === 'scheduled') && b.status !== 'cancelled'
    )
    const pendingAmount = pendingPayouts.reduce((s, b) => s + b.netAmount, 0)

    /* ── Thursday payouts ── */
    const thursdayPayouts = pendingPayouts.filter(b => b.source === 'booking')
    const thursdayAmount = thursdayPayouts.reduce((s, b) => s + b.netAmount, 0)

    /* ── By source ── */
    const bySource = useMemo(() => {
        const m: Record<string, { count: number; net: number; nights: number }> = {}
        pBookings.forEach(b => {
            if (!m[b.source]) m[b.source] = { count: 0, net: 0, nights: 0 }
            m[b.source].count++
            m[b.source].net += b.netAmount
            m[b.source].nights += b.nights
        })
        return m
    }, [pBookings])

    /* ── Today alerts ── */
    const today = new Date().toISOString().split('T')[0]
    const todayCheckIns = bookings.filter(b => b.checkIn === today && b.status === 'confirmed')
    const todayCheckOuts = bookings.filter(b => b.checkOut === today)
    const urgentTasks = tasks.filter(t => t.status === 'urgent' || (t.status === 'pending' && t.due_date <= today))

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm font-medium text-gray-500">Chargement…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                        {properties.length} propriété{properties.length > 1 ? 's' : ''} · {bookings.length} réservations
                    </p>
                </div>

                {/* Period selector */}
                <div className="relative">
                    <button onClick={() => setPeriodOpen(!periodOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-300 hover:shadow-sm transition-all">
                        <CalendarDays className="w-4 h-4 text-blue-500" />
                        {period.label}
                        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', periodOpen && 'rotate-180')} />
                    </button>
                    {periodOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-30 max-h-72 overflow-y-auto">
                            {periods.map(p => (
                                <button key={p.label} onClick={() => { setPeriod(p); setPeriodOpen(false) }}
                                    className={cn('w-full text-left px-4 py-2 text-sm transition-colors',
                                        period.label === p.label ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Today Alerts */}
            {(todayCheckIns.length > 0 || todayCheckOuts.length > 0 || urgentTasks.length > 0) && (
                <div className="flex flex-wrap gap-2">
                    {todayCheckIns.length > 0 && (
                        <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-semibold text-emerald-700">
                                {todayCheckIns.length} check-in{todayCheckIns.length > 1 ? 's' : ''} aujourd'hui
                            </span>
                        </div>
                    )}
                    {todayCheckOuts.length > 0 && (
                        <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-xs font-semibold text-blue-700">
                                {todayCheckOuts.length} check-out{todayCheckOuts.length > 1 ? 's' : ''} aujourd'hui
                            </span>
                        </div>
                    )}
                    {urgentTasks.length > 0 && (
                        <div className="flex items-center gap-2 px-3.5 py-2 bg-red-50 border border-red-200 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-semibold text-red-700">
                                {urgentTasks.length} tâche{urgentTasks.length > 1 ? 's' : ''} urgente{urgentTasks.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Net Revenue */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        {fees > 0 && (
                            <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                                -{formatMAD(fees)} comm.
                            </span>
                        )}
                    </div>
                    <p className="text-xl font-bold text-gray-900">{formatMAD(net)}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Chiffre d'affaires net</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">Brut: {formatMAD(revenue)}</p>
                </div>

                {/* Occupancy */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <BedDouble className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {bookedNights}/{availableNights} nuits
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-xl font-bold text-gray-900">{occupancy}%</p>
                        <div className="flex-1 mb-1">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={cn('h-full rounded-full transition-all duration-1000',
                                    occupancy >= 70 ? 'bg-emerald-500' : occupancy >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                )} style={{ width: `${Math.min(occupancy, 100)}%` }} />
                            </div>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">Taux d'occupation</p>
                </div>

                {/* Active Bookings */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                            <CalendarCheck className="w-5 h-5 text-violet-600" />
                        </div>
                        {pendingBookings > 0 && (
                            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                {pendingBookings} en attente
                            </span>
                        )}
                    </div>
                    <p className="text-xl font-bold text-gray-900">{activeBookings}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Réservations confirmées</p>
                    <p className="text-[10px] text-gray-300">{pBookings.length} total</p>
                </div>

                {/* Pending Payouts */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-blue-200 bg-white/10 px-2 py-0.5 rounded-md">
                            {pendingPayouts.length} paiement{pendingPayouts.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <p className="text-xl font-bold">{formatMAD(pendingAmount)}</p>
                    <p className="text-[11px] text-blue-200 mt-0.5">Paiements en attente</p>
                </div>
            </div>

            {/* Revenue Overview + Upcoming */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Revenue by source */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-500" />
                            Répartition des revenus
                        </h2>
                        <span className="text-xs text-gray-400">{period.label}</span>
                    </div>

                    <div className="space-y-5">
                        {(['airbnb', 'booking', 'direct'] as const).map(source => {
                            const data = bySource[source] || { count: 0, net: 0, nights: 0 }
                            const colors = getSourceColor(source)
                            const pct = net > 0 ? Math.round((data.net / net) * 100) : 0
                            const label = source === 'booking' ? 'Booking.com' : source === 'direct' ? 'Réservation directe' : 'Airbnb'

                            return (
                                <div key={source}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold', colors.gradient)}>
                                                {source === 'airbnb' ? '🏡' : source === 'booking' ? '🏨' : '✨'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{label}</p>
                                                <p className="text-[11px] text-gray-400">{data.count} rés · {data.nights} nuits</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">{formatMAD(data.net)}</p>
                                            <p className="text-[11px] text-gray-400">{pct}%</p>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                        <div className={cn('h-full rounded-full transition-all duration-700', colors.dot)} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-50">
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{formatMAD(bookedNights > 0 ? revenue / bookedNights : 0)}</p>
                            <p className="text-[10px] text-gray-400">Prix moy./nuit</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{pBookings.length}</p>
                            <p className="text-[10px] text-gray-400">Réservations</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-red-500">{formatMAD(fees)}</p>
                            <p className="text-[10px] text-gray-400">Commissions</p>
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Thursday payout */}
                    {thursdayAmount > 0 && (
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-blue-200" />
                                <span className="text-xs font-semibold text-blue-200">Prochain jeudi</span>
                            </div>
                            <p className="text-xl font-bold">{formatMAD(thursdayAmount)}</p>
                            <p className="text-[11px] text-blue-200 mt-0.5">
                                Versement Booking.com · {thursdayPayouts.length} réservation{thursdayPayouts.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    )}

                    {/* Pending payouts list */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Paiements en attente</h3>
                        {pendingPayouts.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">Aucun paiement en attente</p>
                        ) : (
                            <div className="space-y-2.5">
                                {pendingPayouts.slice(0, 4).map(p => {
                                    const sc = getSourceColor(p.source)
                                    return (
                                        <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-50 transition-colors">
                                            <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-[11px] font-bold text-white', sc.gradient)}>
                                                {p.source === 'airbnb' ? 'AB' : p.source === 'booking' ? 'BK' : 'DR'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{p.guestName}</p>
                                                <p className="text-[10px] text-gray-400">{formatDateShort(p.checkOut)}</p>
                                            </div>
                                            <p className="text-xs font-bold text-gray-900">{formatMAD(p.netAmount)}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Quick actions */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions rapides</h3>
                        <div className="space-y-2">
                            <Link to="/bookings/new"
                                className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                                <Plus className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-700">Nouvelle réservation</span>
                            </Link>
                            <Link to="/analytics"
                                className="flex items-center gap-3 p-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 transition-colors">
                                <TrendingUp className="w-4 h-4 text-violet-600" />
                                <span className="text-xs font-semibold text-violet-700">Voir les analytiques</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Properties Overview */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        Mes propriétés
                    </h2>
                    <Link to="/properties" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                        Gérer →
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {properties.map(prop => {
                        const propBookings = pBookings.filter(b => b.propertyId === prop.id)
                        const propNet = propBookings.reduce((s, b) => s + b.netAmount, 0)
                        const propNights = propBookings.reduce((s, b) => s + b.nights, 0)
                        const propOccupancy = period.days > 0 ? Math.round((propNights / period.days) * 100) : 0

                        return (
                            <div key={prop.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <img src={prop.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200'} alt=""
                                    className="w-14 h-14 rounded-xl object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{prop.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {prop.airbnb_url && <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Airbnb</span>}
                                        {prop.booking_url && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Booking</span>}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                                        <span>{propBookings.length} rés</span>
                                        <span>{propOccupancy}% occ</span>
                                        <span className="font-semibold text-emerald-600">{formatMAD(propNet)}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <h2 className="text-[15px] font-semibold text-gray-900">Réservations récentes</h2>
                    <Link to="/bookings" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                        Voir tout →
                    </Link>
                </div>
                <div className="divide-y divide-gray-50">
                    {bookings.slice(0, 6).map(b => {
                        const sc = getSourceColor(b.source)
                        const st = getStatusBadge(b.status)
                        const ps = getStatusBadge(b.paymentStatus)

                        return (
                            <div key={b.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                                {/* Source badge */}
                                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[11px] font-bold shrink-0', sc.gradient)}>
                                    {b.source === 'airbnb' ? 'AB' : b.source === 'booking' ? 'BK' : 'DR'}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{b.guestName}</p>
                                        {b.nationality && (
                                            <span className="text-[10px] text-gray-400 hidden sm:inline">{b.nationality}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                                        {b.propertyName && <><span>{b.propertyName}</span><span>·</span></>}
                                        <span>{formatDateShort(b.checkIn)} → {formatDateShort(b.checkOut)}</span>
                                        <span>·</span>
                                        <span>{b.nights}n</span>
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="text-right shrink-0 hidden sm:block">
                                    <p className="text-sm font-bold text-gray-900">{formatMAD(b.netAmount)}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                                        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', st.bg, st.text)}>
                                            {st.label}
                                        </span>
                                        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', ps.bg, ps.text)}>
                                            {ps.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {bookings.length === 0 && (
                    <div className="text-center py-12">
                        <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Aucune réservation</p>
                        <Link to="/bookings/new"
                            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700">
                            <Plus className="w-4 h-4" /> Ajouter
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
