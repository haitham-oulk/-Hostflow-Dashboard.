import {
    DollarSign, ArrowDownRight, HandCoins, Building2,
    CalendarCheck, Receipt, Globe, AlertCircle, Percent, Info,
    CreditCard, BadgeCheck, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/* ── UI HELPERS ── */
function formatMAD(value: number) {
    return new Intl.NumberFormat('fr-MA', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value) + ' MAD'
}

/* ── MOCK DATA FOR THE AREA CHART (HISTORICAL EXTRACT) ── */
// (Since we don't have months of historical DB data yet, we keep the area chart mock for immediate visual satisfaction)
const evolutionData = [
    { name: 'Jan', revenue: 24000 },
    { name: 'Fév', revenue: 13980 },
    { name: 'Mar', revenue: 38000 },
    { name: 'Avr', revenue: 39080 },
    { name: 'Mai', revenue: 48000 },
    { name: 'Juin', revenue: 38000 },
    { name: 'Juil', revenue: 43000 },
]

const donutColors = ['#f43f5e', '#3b82f6', '#10b981'] // Airbnb (Rose), Booking (Blue), Direct (Green)

/* ── COMPONENT ── */
export default function Finance() {
    const [loading, setLoading] = useState(true)

    // Data states
    const [totalBrut, setTotalBrut] = useState(0)
    const [totalCommissions, setTotalCommissions] = useState(0)
    const [totalNet, setTotalNet] = useState(0)
    const [totalTaxes, setTotalTaxes] = useState(0)

    // Additional metrics
    const [totalNights, setTotalNights] = useState(0)
    const [totalCleaning, setTotalCleaning] = useState(0)
    const [paidAmount, setPaidAmount] = useState(0)
    const [pendingAmount, setPendingAmount] = useState(0)

    // Charts & Table
    const [recentPayouts, setRecentPayouts] = useState<any[]>([])
    const [donutData, setDonutData] = useState<any[]>([])
    const [canalBarData, setCanalBarData] = useState<any[]>([])
    const [performanceData, setPerformanceData] = useState<any>({ airbnb: { brut: 0, net: 0, frais: 0 }, booking: { brut: 0, net: 0, frais: 0 } })

    useEffect(() => {
        async function loadFinance() {
            setLoading(true)
            try {
                // Fetch all bookings to calculate metrics
                const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })

                if (!data || data.length === 0) {
                    setLoading(false)
                    return
                }

                // Aggregators
                let brut = 0; let net = 0; let taxes = 0; let comms = 0;
                let nights = 0; let cleaning = 0;
                let paid = 0; let pending = 0;

                // Channel aggregators (using Net Revenue)
                let revAirbnb = 0; let revBooking = 0; let revDirect = 0;

                // Detailed performance for horizontal bars
                let perfAirbnb = { brut: 0, net: 0, frais: 0 }
                let perfBooking = { brut: 0, net: 0, frais: 0 }

                data.forEach(b => {
                    const bBrut = Number(b.total_amount_mad || 0)
                    const bNet = Number(b.net_payout_mad || 0)
                    const bComms = Number(b.commission_amount_mad || 0)
                    const bTax = Number(b.city_tax_mad || 0)

                    brut += bBrut
                    net += bNet
                    comms += bComms
                    taxes += bTax
                    nights += Number(b.nights || 0)
                    cleaning += Number(b.cleaning_fee_mad || 0)

                    if (b.payout_status?.toLowerCase() === 'paid') paid += bNet
                    if (b.payout_status?.toLowerCase() === 'pending' || b.payout_status?.toLowerCase() === 'processing') pending += bNet

                    // Channel grouping
                    const platform = (b.platform || '').toLowerCase()
                    if (platform.includes('airbnb')) {
                        revAirbnb += bNet
                        perfAirbnb.brut += bBrut; perfAirbnb.net += bNet; perfAirbnb.frais += bComms;
                    }
                    else if (platform.includes('booking')) {
                        revBooking += bNet
                        perfBooking.brut += bBrut; perfBooking.net += bNet; perfBooking.frais += bComms;
                    }
                    else revDirect += bNet
                })

                setTotalBrut(brut); setTotalNet(net); setTotalCommissions(comms); setTotalTaxes(taxes);
                setTotalNights(nights); setTotalCleaning(cleaning);
                setPaidAmount(paid); setPendingAmount(pending);

                // Set Donut Chart Data (Net Revenue % per channel)
                const totalChannelRev = revAirbnb + revBooking + revDirect
                if (totalChannelRev > 0) {
                    setDonutData([
                        { name: 'Airbnb', value: Math.round((revAirbnb / totalChannelRev) * 100) },
                        { name: 'Booking', value: Math.round((revBooking / totalChannelRev) * 100) },
                        { name: 'Direct', value: Math.round((revDirect / totalChannelRev) * 100) },
                    ])
                }

                // Set Bar Chart Data (Brut Volume)
                setCanalBarData([
                    { name: 'Airbnb', total: perfAirbnb.brut, fill: '#f43f5e' },
                    { name: 'Booking.com', total: perfBooking.brut, fill: '#3b82f6' },
                    { name: 'Direct', total: brut - perfAirbnb.brut - perfBooking.brut, fill: '#10b981' },
                ])

                setPerformanceData({ airbnb: perfAirbnb, booking: perfBooking })
                setRecentPayouts(data.slice(0, 10)) // Top 10 for the table

            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadFinance()
    }, [])

    const kpis = [
        { label: "Revenu Brut (YTD)", value: formatMAD(totalBrut), icon: Globe, bg: "bg-slate-50", text: "text-slate-500", iconColor: "text-slate-400" },
        { label: "Paiements reçus", value: formatMAD(paidAmount), icon: HandCoins, bg: "bg-emerald-50", text: "text-emerald-500", iconColor: "text-emerald-500" },
        { label: "Total Frais & Commissions", value: formatMAD(totalCommissions), icon: Receipt, bg: "bg-rose-50", text: "text-rose-500", iconColor: "text-rose-500" },
        { label: "Taxes de séjour (à reverser)", value: formatMAD(totalTaxes), icon: Building2, bg: "bg-blue-50", text: "text-blue-500", iconColor: "text-blue-500" },
        // Secondary row
        { label: "Revenu Moyen par Nuit", value: totalNights > 0 ? formatMAD(totalNet / totalNights) : "0 MAD", icon: CalendarCheck, bg: "bg-violet-50", text: "text-violet-500", iconColor: "text-violet-500" },
        { label: "Taux de Commission Moyen", value: totalBrut > 0 ? `${((totalCommissions / totalBrut) * 100).toFixed(1)}%` : "0%", icon: Percent, bg: "bg-amber-50", text: "text-amber-500", iconColor: "text-amber-500" },
        { label: "Frais de ménage perçus", value: formatMAD(totalCleaning), icon: DollarSign, bg: "bg-cyan-50", text: "text-cyan-500", iconColor: "text-cyan-500" },
        { label: "Paiements en attente", value: formatMAD(pendingAmount), icon: ArrowDownRight, bg: "bg-slate-50", text: "text-slate-500", iconColor: "text-slate-400" },
    ]

    function StatusBadge({ status }: { status: string }) {
        const s = (status || '').toLowerCase()
        if (s === 'paid') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100"><BadgeCheck className="w-3.5 h-3.5" /> Payé</span>
        if (s === 'pending') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100"><AlertCircle className="w-3.5 h-3.5" /> En attente</span>
        if (s === 'processing') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100"><Loader2 className="w-3.5 h-3.5 animate-spin" /> En cours</span>
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 capitalize">{status || 'Inconnu'}</span>
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-heading font-bold tracking-tight text-slate-900">Finance & Trésorerie</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Supervisez les marges nettes, les commissions et les versements en temps réel.
                </p>
            </div>

            {/* 8 Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <div key={i} className="flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[13px] font-medium text-slate-500">{kpi.label}</h3>
                            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", kpi.bg)}>
                                <kpi.icon className={cn("h-4 w-4", kpi.iconColor)} strokeWidth={2.5} />
                            </div>
                        </div>
                        <p className={cn("text-xl font-heading font-bold", i === 0 || i > 3 ? "text-slate-900" : kpi.text)}>
                            {loading ? <span className="inline-block h-6 w-20 bg-slate-100 rounded animate-pulse" /> : kpi.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Charts Row: Line & Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-[20px] border border-slate-200/60 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-heading font-semibold text-slate-900">Évolution des revenus nets</h2>
                            <p className="text-sm text-slate-500">Tendances financières sur les 7 derniers mois</p>
                        </div>
                    </div>
                    <div className="h-[260px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="financeRed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }} formatter={(v: number) => [formatMAD(v), 'Revenu']} />
                                <Area type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#financeRed)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-[20px] border border-slate-200/60 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-heading font-semibold text-slate-900">Revenus par canal</h2>
                        <p className="text-sm text-slate-500">Volumes bruts générés</p>
                    </div>
                    <div className="h-[260px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={canalBarData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={80} />
                                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }} formatter={(v: number) => [formatMAD(v), 'CA Brut']} />
                                <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={24}>
                                    {canalBarData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* "Cœur Financier": Donut & Commissions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-[20px] border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col items-center">
                    <h2 className="text-lg font-heading font-semibold text-slate-900 w-full mb-1">Répartition par canal</h2>
                    <p className="text-sm text-slate-500 w-full mb-6">Part de marché (% revenus nets)</p>

                    <div className="h-[220px] w-full flex items-center justify-center">
                        {donutData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={donutData} innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                                        {donutData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }} formatter={(v: number) => [`${v}%`, 'Parts']} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-sm text-slate-400">Aucune donnée</div>
                        )}
                    </div>
                </div>

                <div className="rounded-[20px] border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600">
                            <Info className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-heading font-semibold text-slate-900">Détail des commissions</h2>
                            <p className="text-sm text-slate-500">Règles appliquées automatiquement</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                                <span className="font-semibold text-slate-700">Airbnb</span>
                            </div>
                            <span className="font-bold text-slate-900">3.00%</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                <span className="font-semibold text-slate-700">Booking.com</span>
                            </div>
                            <span className="font-bold text-slate-900 text-right">
                                22.00%
                                <span className="block text-[10px] text-slate-500 font-normal">TVA incluse</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                                <span className="font-semibold text-slate-700">Direct</span>
                            </div>
                            <span className="font-bold text-slate-900">0.00%</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-[20px] border border-slate-200/60 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-heading font-semibold text-slate-900 mb-1">Performance par canal</h2>
                    <p className="text-sm text-slate-500 mb-6">Bénéfices post-commission</p>

                    <div className="space-y-5">
                        {/* Airbnb Perf Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-rose-500">Airbnb</span>
                                <span className="font-bold text-slate-900">{formatMAD(performanceData.airbnb.net)} net</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-rose-500 h-2 rounded-full"
                                    style={{ width: performanceData.airbnb.brut > 0 ? `${(performanceData.airbnb.net / performanceData.airbnb.brut) * 100}%` : '0%' }}
                                ></div>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Brut: {formatMAD(performanceData.airbnb.brut)} | Frais: -{formatMAD(performanceData.airbnb.frais)}
                            </p>
                        </div>

                        {/* Booking.com Perf Bar */}
                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-blue-500">Booking.com</span>
                                <span className="font-bold text-slate-900">{formatMAD(performanceData.booking.net)} net</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: performanceData.booking.brut > 0 ? `${(performanceData.booking.net / performanceData.booking.brut) * 100}%` : '0%' }}
                                ></div>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Brut: {formatMAD(performanceData.booking.brut)} | Frais: -{formatMAD(performanceData.booking.frais)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pink Banner */}
            <div className="rounded-[16px] border border-pink-200 bg-pink-50/50 p-5 flex items-start gap-4">
                <div className="mt-0.5">
                    <CreditCard className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-pink-900">Calendrier des paiements & Versements</h3>
                    <p className="text-sm text-pink-700 mt-1 leading-relaxed">
                        <strong>Airbnb</strong> effectue les versements 24h après le check-in.
                        <strong>Booking.com</strong> versements groupés mensuels versés entre le 10 et le 15.
                        Assurez-vous que vos coordonnées RIB sont à jour.
                    </p>
                </div>
            </div>

            {/* Payouts Table */}
            <div className="rounded-[20px] border border-slate-200/60 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-heading font-semibold text-slate-900">Statut des paiements</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Historique des versements prévus et reçus
                        </p>
                    </div>
                    {loading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
                </div>

                <div className="overflow-x-auto min-h-[200px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 font-medium border-b border-slate-100">Date Check-in</th>
                                <th className="px-6 py-4 font-medium border-b border-slate-100">Date Check-out</th>
                                <th className="px-6 py-4 font-medium border-b border-slate-100">Client / UID</th>
                                <th className="px-6 py-4 font-medium border-b border-slate-100">Canal</th>
                                <th className="px-6 py-4 font-medium text-right border-b border-slate-100">Montant Net</th>
                                <th className="px-6 py-4 font-medium text-center border-b border-slate-100">Statut Payout</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentPayouts.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Aucune donnée financière disponible dans la base de données.
                                    </td>
                                </tr>
                            ) : recentPayouts.map((row, idx) => (
                                <tr key={row.id || idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {row.check_in ? new Date(row.check_in).toLocaleDateString('fr-FR') : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {row.check_out ? new Date(row.check_out).toLocaleDateString('fr-FR') : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {row.hosted_names || `BK-${String(row.id).slice(0, 6)}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "font-semibold capitalize",
                                            row.platform?.toLowerCase() === 'airbnb' ? "text-rose-500" :
                                                row.platform?.toLowerCase() === 'booking' ? "text-blue-500" : "text-emerald-500"
                                        )}>
                                            {row.platform || 'Direct'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-heading font-bold text-slate-900 text-right">
                                        {formatMAD(Number(row.net_payout_mad || 0))}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <StatusBadge status={row.payout_status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}
