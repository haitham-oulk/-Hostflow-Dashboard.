import { useState, useMemo } from 'react'
import {
    BarChart3, TrendingUp, DollarSign, Users, Building2,
    CalendarCheck, Globe, ChevronDown, Percent, Clock, Star
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const CLEANING_COST = 200

function formatMADLocal(value: number): string {
    return new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) + ' MAD'
}

const MONTHS = [
    { label: 'Janvier 2025', start: '2025-01-01', end: '2025-01-31', days: 31 },
    { label: 'Février 2025', start: '2025-02-01', end: '2025-02-28', days: 28 },
    { label: 'Mars 2025', start: '2025-03-01', end: '2025-03-31', days: 31 },
    { label: 'Avril 2025', start: '2025-04-01', end: '2025-04-30', days: 30 },
    { label: 'Mai 2025', start: '2025-05-01', end: '2025-05-31', days: 31 },
    { label: 'Juin 2025', start: '2025-06-01', end: '2025-06-30', days: 30 },
    { label: 'Juillet 2025', start: '2025-07-01', end: '2025-07-31', days: 31 },
    { label: 'Août 2025', start: '2025-08-01', end: '2025-08-31', days: 31 },
    { label: 'Septembre 2025', start: '2025-09-01', end: '2025-09-30', days: 30 },
    { label: 'Octobre 2025', start: '2025-10-01', end: '2025-10-31', days: 31 },
    { label: 'Novembre 2025', start: '2025-11-01', end: '2025-11-30', days: 30 },
    { label: 'Décembre 2025', start: '2025-12-01', end: '2025-12-31', days: 31 },
    { label: 'Janvier 2026', start: '2026-01-01', end: '2026-01-31', days: 31 },
    { label: 'Février 2026', start: '2026-02-01', end: '2026-02-28', days: 28 },
    { label: 'Mars 2026', start: '2026-03-01', end: '2026-03-31', days: 31 },
]

const SOURCE_COLORS: Record<string, { dot: string; bg: string; border: string; text: string }> = {
    airbnb: { dot: 'bg-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
    booking: { dot: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    direct: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
}

export default function Analytics() {
    const { bookings, loading } = useStore()
    const [selectedPeriod, setSelectedPeriod] = useState(MONTHS[MONTHS.length - 1])
    const [periodOpen, setPeriodOpen] = useState(false)
    const [platformFilter, setPlatformFilter] = useState<string>('all')

    // Filter bookings by period
    const filtered = useMemo(() => {
        return bookings.filter((b: any) => {
            const matchPeriod = b.checkIn >= selectedPeriod.start && b.checkIn <= selectedPeriod.end
            const matchPlatform = platformFilter === 'all' || b.source === platformFilter
            return matchPeriod && matchPlatform
        })
    }, [bookings, selectedPeriod, platformFilter])

    // KPIs
    const totalNet = filtered.reduce((s: number, b: any) => s + b.netAmount, 0)
    const totalProfit = filtered.reduce((s: number, b: any) => s + (b.netAmount - CLEANING_COST), 0)
    const totalNights = filtered.reduce((s: number, b: any) => s + b.nights, 0)
    const totalGuests = filtered.reduce((s: number, b: any) => s + b.guestCount, 0)
    const avgNightlyRate = totalNights > 0 ? totalNet / totalNights : 0
    const avgStayLength = filtered.length > 0 ? totalNights / filtered.length : 0

    // Occupancy (assume 1 property)
    const availableNights = selectedPeriod.days
    const occupancyRate = availableNights > 0 ? Math.min(100, Math.round((totalNights / availableNights) * 100)) : 0

    // By source
    const bySource = useMemo(() => {
        const map: Record<string, { count: number; revenue: number; profit: number; nights: number; cleaning: number }> = {}
        filtered.forEach((b: any) => {
            if (!map[b.source]) map[b.source] = { count: 0, revenue: 0, profit: 0, nights: 0, cleaning: 0 }
            map[b.source].count++
            map[b.source].revenue += b.netAmount
            map[b.source].profit += b.netAmount - CLEANING_COST
            map[b.source].nights += b.nights
            map[b.source].cleaning += CLEANING_COST
        })
        return map
    }, [filtered])

    // By nationality
    const byNationality = useMemo(() => {
        const map: Record<string, number> = {}
        filtered.forEach((b: any) => {
            const nat = b.nationality || 'Non renseigné'
            map[nat] = (map[nat] || 0) + 1
        })
        return Object.entries(map).sort((a, b) => b[1] - a[1])
    }, [filtered])

    // Payout status
    const paidCount = filtered.filter((b: any) => b.paymentStatus === 'paid').length
    const pendingCount = filtered.filter((b: any) => b.paymentStatus === 'pending' || b.paymentStatus === 'scheduled').length
    const pendingAmount = filtered.filter((b: any) => b.paymentStatus === 'pending' || b.paymentStatus === 'scheduled').reduce((s: number, b: any) => s + b.netAmount, 0)

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-blue-500" />
                        Analytiques
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Analyse détaillée de vos performances</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Platform filter */}
                    <select value={platformFilter}
                        onChange={(e) => setPlatformFilter(e.target.value)}
                        className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm">
                        <option value="all">Toutes plateformes</option>
                        <option value="airbnb">Airbnb</option>
                        <option value="booking">Booking.com</option>
                        <option value="direct">Direct</option>
                    </select>

                    {/* Period */}
                    <div className="relative">
                        <button onClick={() => setPeriodOpen(!periodOpen)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-blue-300 transition-all shadow-sm">
                            <CalendarCheck className="w-4 h-4 text-blue-500" />
                            {selectedPeriod.label}
                            <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', periodOpen && 'rotate-180')} />
                        </button>
                        {periodOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-20 max-h-80 overflow-y-auto">
                                {MONTHS.map(m => (
                                    <button key={m.label} onClick={() => { setSelectedPeriod(m); setPeriodOpen(false) }}
                                        className={cn(
                                            'w-full text-left px-4 py-2.5 text-sm transition-colors',
                                            selectedPeriod.label === m.label ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                                        )}>
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin mr-3" />
                    Chargement des données…
                </div>
            )}

            {!loading && (
                <>
                    {/* KPI Row 1 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'Revenue net', value: formatMADLocal(totalNet), Icon: DollarSign, color: 'blue' },
                            { label: 'Profit net', value: formatMADLocal(totalProfit), Icon: TrendingUp, color: 'emerald' },
                            { label: 'En attente', value: formatMADLocal(pendingAmount), Icon: Percent, color: 'red' },
                            { label: 'Réservations', value: filtered.length.toString(), Icon: CalendarCheck, color: 'violet' },
                            { label: 'Occupation', value: `${occupancyRate}%`, Icon: Building2, color: 'amber' },
                            { label: 'Voyageurs', value: totalGuests.toString(), Icon: Users, color: 'sky' },
                        ].map((kpi) => (
                            <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-sm transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                <div className={`w-8 h-8 rounded-lg bg-${kpi.color}-50 flex items-center justify-center mb-3`}>
                                    <kpi.Icon className={`w-4 h-4 text-${kpi.color}-600`} />
                                </div>
                                <p className="text-lg font-bold text-slate-900">{kpi.value}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{kpi.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* KPI Row 2 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                            <p className="text-xs text-slate-400 mb-1">Nuits réservées</p>
                            <p className="text-xl font-bold text-slate-900">{totalNights}</p>
                            <p className="text-[11px] text-slate-400">sur {availableNights} disponibles</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                            <p className="text-xs text-slate-400 mb-1">Prix moyen / nuit</p>
                            <p className="text-xl font-bold text-slate-900">{formatMADLocal(avgNightlyRate)}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                            <p className="text-xs text-slate-400 mb-1">Durée moy. séjour</p>
                            <p className="text-xl font-bold text-slate-900">{avgStayLength.toFixed(1)} nuits</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                            <p className="text-xs text-slate-400 mb-1">Statut paiements</p>
                            <p className="text-xl font-bold text-slate-900">{paidCount} <span className="text-emerald-500 text-sm">payés</span> / {pendingCount} <span className="text-amber-500 text-sm">en attente</span></p>
                        </div>
                    </div>

                    {/* Source breakdown + Occupancy */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* By Source */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                            <h2 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-500" />
                                Répartition par plateforme
                            </h2>
                            <div className="space-y-5">
                                {(['airbnb', 'booking', 'direct'] as const).map(source => {
                                    const data = bySource[source]
                                    const colors = SOURCE_COLORS[source]
                                    if (!data) return (
                                        <div key={source} className="flex items-center gap-3 opacity-40">
                                            <div className={cn('w-3 h-3 rounded-full', colors.dot)} />
                                            <span className="text-sm text-slate-500 capitalize">
                                                {source === 'booking' ? 'Booking.com' : source === 'direct' ? 'Directe' : 'Airbnb'}
                                            </span>
                                            <span className="text-xs text-slate-400 ml-auto">Aucune donnée</span>
                                        </div>
                                    )
                                    const pct = totalNet > 0 ? Math.round((data.revenue / totalNet) * 100) : 0

                                    return (
                                        <div key={source} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={cn('w-3 h-3 rounded-full', colors.dot)} />
                                                    <span className="text-sm font-medium text-slate-700 capitalize">
                                                        {source === 'booking' ? 'Booking.com' : source === 'direct' ? 'Directe' : 'Airbnb'}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-slate-900">{formatMADLocal(data.revenue)}</span>
                                                    <span className="text-xs text-slate-400 ml-2">{pct}%</span>
                                                </div>
                                            </div>
                                            <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                                                <div className={cn('h-full rounded-full transition-all duration-700', colors.dot)} style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="flex items-center gap-4 text-[11px] text-slate-400">
                                                <span>{data.count} rés.</span>
                                                <span>{data.nights} nuits</span>
                                                <span className="text-emerald-500">Profit: {formatMADLocal(data.profit)}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Occupancy visual */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                Taux d'occupation
                            </h2>
                            <div className="flex items-center justify-center py-6">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none" stroke={occupancyRate >= 70 ? '#10b981' : occupancyRate >= 40 ? '#f59e0b' : '#ef4444'}
                                            strokeWidth="3" strokeDasharray={`${occupancyRate}, 100`}
                                            strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-slate-900">{occupancyRate}%</span>
                                        <span className="text-xs text-slate-400">Occupation</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                                    <p className="text-lg font-bold text-emerald-700">{totalNights}</p>
                                    <p className="text-[11px] text-emerald-600">Nuits occupées</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-xl">
                                    <p className="text-lg font-bold text-slate-700">{Math.max(0, availableNights - totalNights)}</p>
                                    <p className="text-[11px] text-slate-500">Nuits disponibles</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nationality + Commission Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Nationality */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                Nationalités des voyageurs
                            </h2>
                            {byNationality.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {byNationality.slice(0, 8).map(([nat, count]) => {
                                        const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0
                                        return (
                                            <div key={nat} className="flex items-center gap-3">
                                                <span className="text-sm text-slate-700 w-32 truncate">{nat}</span>
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-violet-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs font-medium text-slate-500 w-16 text-right">{count} ({pct}%)</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Commission Analysis */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                            <h2 className="text-base font-semibold text-slate-900 mb-4">💸 Analyse des commissions</h2>
                            <div className="space-y-3">
                                {(['airbnb', 'booking', 'direct'] as const).map(source => {
                                    const data = bySource[source]
                                    if (!data) return null
                                    const colors = SOURCE_COLORS[source]
                                    const cleaningTotal = data.cleaning
                                    const netAfterCleaning = data.revenue
                                    const grossEstimate = source === 'airbnb'
                                        ? netAfterCleaning / 0.97
                                        : source === 'booking'
                                            ? netAfterCleaning / 0.78
                                            : netAfterCleaning
                                    const estimatedFees = grossEstimate - netAfterCleaning

                                    return (
                                        <div key={source} className={cn('p-4 rounded-xl border', colors.bg, colors.border)}>
                                            <p className={cn('text-sm font-semibold mb-2', colors.text)}>
                                                {source === 'booking' ? 'Booking.com' : source === 'direct' ? 'Directe' : 'Airbnb'}
                                            </p>
                                            <div className="space-y-1.5 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Net reçu</span>
                                                    <span className="font-medium">{formatMADLocal(data.revenue)}</span>
                                                </div>
                                                {source !== 'direct' && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Commissions estimées</span>
                                                        <span className="font-medium text-red-500">~{formatMADLocal(estimatedFees)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Ménage ({data.count}×{CLEANING_COST})</span>
                                                    <span className="font-medium text-amber-600">-{formatMADLocal(cleaningTotal)}</span>
                                                </div>
                                                <div className="border-t pt-1.5 flex justify-between">
                                                    <span className="font-semibold">Profit</span>
                                                    <span className="font-bold text-emerald-600">{formatMADLocal(data.profit)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
