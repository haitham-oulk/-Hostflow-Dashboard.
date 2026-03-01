import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
    DollarSign, CalendarCheck, CreditCard, Percent,
    Users, BedDouble
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

/* ── Types ── */
interface KPI {
    label: string
    value: string
    icon: typeof DollarSign
    colorClass: string // For the pastel background and icon color
}

/* ── Mock Data for Charts (Aperçu des revenus & Taux d'occupation) ── */
const revenueData = [
    { name: 'Jan', revenue: 12000 },
    { name: 'Fév', revenue: 15500 },
    { name: 'Mar', revenue: 11000 },
    { name: 'Avr', revenue: 18000 },
    { name: 'Mai', revenue: 22000 },
    { name: 'Juin', revenue: 28000 },
    { name: 'Juil', revenue: 35000 },
]

const occupancyData = [
    { name: '1', rate: 65 },
    { name: '2', rate: 70 },
    { name: '3', rate: 60 },
    { name: '4', rate: 85 },
    { name: '5', rate: 90 },
    { name: '6', rate: 95 },
    { name: '7', rate: 80 },
]

/* ── Helpers ── */
function formatMAD(value: number) {
    return new Intl.NumberFormat('fr-MA', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value) + ' MAD'
}

/* ── Component ── */
export default function Dashboard() {
    const [loading, setLoading] = useState(true)

    // KPI States
    const [revenue, setRevenue] = useState(0)
    const [bookingsCount, setBookingsCount] = useState(0)
    const [paymentsPending, setPaymentsPending] = useState(0)
    const [occupancyRate, setOccupancyRate] = useState(0)
    const [todayCheckins, setTodayCheckins] = useState(0)
    const [totalNights, setTotalNights] = useState(0)
    const [recentBookings, setRecentBookings] = useState<any[]>([])

    async function fetchDashboardData() {
        setLoading(true)
        try {
            const today = new Date().toISOString().split('T')[0]
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

            // 1. Total revenue
            const { data: revData } = await supabase.from('bookings').select('net_price').ilike('status', 'payé')
            setRevenue((revData || []).reduce((sum, b) => sum + Number(b.net_price || 0), 0))

            // 2. Bookings count
            const { count: bCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true })
            setBookingsCount(bCount || 0)

            // 3. Pending payments
            const { data: payData } = await supabase.from('bookings').select('net_price').ilike('status', 'en attente')
            setPaymentsPending((payData || []).reduce((sum, b) => sum + Number(b.net_price || 0), 0))

            // 4. Occupancy rate & Nights
            const { data: monthBookings } = await supabase
                .from('bookings')
                .select('check_in, check_out')
                .lte('check_in', endOfMonth)
                .gte('check_out', startOfMonth)

            let bookedNights = 0
            let allNights = 0
            for (const b of monthBookings || []) {
                const cin = new Date(b.check_in)
                const cout = new Date(b.check_out)

                const diffAll = Math.max(0, Math.ceil((cout.getTime() - cin.getTime()) / (1000 * 60 * 60 * 24)))
                allNights += diffAll

                const start = cin < new Date(startOfMonth) ? new Date(startOfMonth) : cin
                const end = cout > new Date(endOfMonth + 'T23:59:59') ? new Date(endOfMonth + 'T23:59:59') : cout
                const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                bookedNights += Math.max(0, diff)
            }
            setOccupancyRate(daysInMonth > 0 ? Math.round((bookedNights / daysInMonth) * 100) : 0)
            setTotalNights(allNights)

            // 5. Check-ins
            const { count: cCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('check_in', today)
            setTodayCheckins(cCount || 0)

            // 6. Recent Bookings
            const { data: recent } = await supabase
                .from('bookings')
                .select('*')
                .order('check_in', { ascending: false })
                .limit(5)
            setRecentBookings(recent || [])

        } catch (err) {
            console.error('API Error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const kpis: KPI[] = [
        { label: "Chiffre d'Affaires", value: formatMAD(revenue), icon: DollarSign, colorClass: "bg-rose-50 text-rose-500" }, // Red
        { label: "Réservations", value: String(bookingsCount), icon: CalendarCheck, colorClass: "bg-blue-50 text-blue-500" }, // Blue
        { label: "Paiements en attente", value: formatMAD(paymentsPending), icon: CreditCard, colorClass: "bg-amber-50 text-amber-500" }, // Yellow
        { label: "Taux d'occupation", value: `${occupancyRate}%`, icon: Percent, colorClass: "bg-emerald-50 text-emerald-500" }, // Green
        { label: "Check-ins du jour", value: String(todayCheckins), icon: Users, colorClass: "bg-purple-50 text-purple-500" }, // Purple
        { label: "Nuits vendues", value: String(totalNights), icon: BedDouble, colorClass: "bg-cyan-50 text-cyan-500" }, // Cyan
    ]

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-heading font-bold tracking-tight text-slate-900">Tableau de Bord</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Vue globale de vos performances et réservations.
                </p>
            </div>

            {/* 6 Top Widgets */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse">
                            <div className="h-10 w-10 bg-slate-100 rounded-xl mb-4" />
                            <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
                            <div className="h-7 w-20 bg-slate-100 rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {kpis.map((kpi, i) => (
                        <div
                            key={i}
                            className="group flex flex-col justify-between rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
                        >
                            <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", kpi.colorClass)}>
                                <kpi.icon className="h-5 w-5" strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[13px] font-medium text-slate-500 mb-1">{kpi.label}</p>
                                <p className="text-xl font-heading font-bold text-slate-900">{kpi.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Chart: Revenue (Red Gradient Line) */}
                <div className="lg:col-span-2 rounded-[20px] border border-slate-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <div className="mb-6">
                        <h2 className="text-lg font-heading font-semibold text-slate-900">Aperçu des revenus</h2>
                        <p className="text-sm text-slate-500">Chiffre d'affaires sur les 7 derniers mois</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(val) => `${val / 1000}k`}
                                />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [`${value} MAD`, 'Revenu']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#f43f5e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Chart: Occupancy (Green Bars) */}
                <div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <div className="mb-6">
                        <h2 className="text-lg font-heading font-semibold text-slate-900">Taux d'occupation</h2>
                        <p className="text-sm text-slate-500">Performance hebdomadaire (%)</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={occupancyData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [`${value}%`, 'Occupation']}
                                />
                                <Bar dataKey="rate" radius={[6, 6, 6, 6]}>
                                    {occupancyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.rate > 80 ? '#10b981' : '#34d399'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Recent Bookings Table */}
            <div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-heading font-semibold text-slate-900">Réservations récentes</h2>
                        <p className="text-sm text-slate-500">Les dernières réservations ajoutées</p>
                    </div>
                </div>
                {loading ? (
                    <div className="h-40 flex items-center justify-center animate-pulse text-slate-400">Chargement...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Plateforme</TableHead>
                                    <TableHead>Arrivée</TableHead>
                                    <TableHead>Départ</TableHead>
                                    <TableHead>Nuitées</TableHead>
                                    <TableHead>Total Net</TableHead>
                                    <TableHead>Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                            Aucune réservation trouvée.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentBookings.map((b) => {
                                        let nights = 0
                                        if (b.check_in && b.check_out) {
                                            const start = new Date(b.check_in)
                                            const end = new Date(b.check_out)
                                            nights = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
                                        }
                                        return (
                                            <TableRow key={b.id}>
                                                <TableCell className="font-medium">{b.guest_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={b.platform?.toLowerCase() === 'airbnb' ? 'airbnb' : b.platform?.toLowerCase() === 'direct' ? 'direct' : 'booking'} className="capitalize">
                                                        {b.platform}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{b.check_in}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{b.check_out}</TableCell>
                                                <TableCell>{nights}</TableCell>
                                                <TableCell className="font-medium text-emerald-600">
                                                    {b.net_price ? formatMAD(Number(b.net_price)) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={b.status?.toLowerCase() === 'payé' ? 'success' : 'warning'} className="capitalize">
                                                        {b.status || 'en attente'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    )
}
