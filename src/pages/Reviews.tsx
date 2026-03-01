import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { Star, ChevronDown, MoreHorizontal, Globe, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WorldMapSVG } from '@/components/ui/WorldMapSVG'

// --- MOCK DATA ---
const statisticsData = [
    { day: '12 Jun', positive: 24, negative: 4 },
    { day: '13 Jun', positive: 18, negative: 2 },
    { day: '14 Jun', positive: 22, negative: 5 },
    { day: '15 Jun', positive: 28, negative: 3 },
    { day: '16 Jun', positive: 15, negative: 6 },
    { day: '17 Jun', positive: 30, negative: 2 },
    { day: '18 Jun', positive: 25, negative: 4 },
]

const categories = [
    { name: 'Facilities', score: 4.4 },
    { name: 'Cleanliness', score: 4.8 },
    { name: 'Services', score: 4.6 },
    { name: 'Comfort', score: 4.8 },
    { name: 'Food and Dining', score: 4.5 },
]

const countries = [
    { name: 'France', percentage: 32, code: 'FR' },
    { name: 'Morocco', percentage: 28, code: 'MA' },
    { name: 'United Kingdom', percentage: 15, code: 'UK' },
    { name: 'Netherlands', percentage: 12, code: 'NL' },
    { name: 'Spain', percentage: 8, code: 'ES' },
    { name: 'Other', percentage: 5, code: 'OT' },
]

const reviews = [
    {
        id: 1,
        name: 'Johan Manulang',
        avatar: 'JM',
        rating: 5,
        date: 'June 18, 2026',
        text: "Fantastic stay! The room was exceptionally clean and comfortable, and the staff were incredibly helpful and friendly. The location was perfect for our needs. Highly recommend this hotel to anyone visiting the area."
    },
    {
        id: 2,
        name: 'Suzi Matsuda',
        avatar: 'SM',
        rating: 4,
        date: 'June 12, 2026',
        text: "Great location and very friendly staff. The room was cozy and well maintained. The breakfast could have offered more variety, but overall it was a very good experience. I would stay here again."
    },
    {
        id: 3,
        name: 'Donnie Wong',
        avatar: 'DW',
        rating: 3,
        date: 'June 10, 2026',
        text: "The room was nice and the bed was comfortable, but there were some maintenance issues. The air conditioning was not working properly, which made the room quite warm at night."
    },
    {
        id: 4,
        name: 'Isia de Lacosta',
        avatar: 'IL',
        rating: 5,
        date: 'June 8, 2026',
        text: "Amazing service and a beautiful hotel. The amenities were top-notch, especially the spa, which I thoroughly enjoyed. The staff were very attentive and made my stay truly memorable. Will definitely return!"
    }
]

// --- COMPONENTS ---

const CircularScore = ({ score, total }: { score: number, total: number }) => {
    const radius = 38
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (score / 5) * circumference

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg className="transform -rotate-90 w-28 h-28">
                <circle cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle
                    cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    className="text-[#c2f34e] transition-all duration-1000 ease-out" strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-heading text-slate-900 leading-none">{score}</span>
                <span className="text-[10px] text-slate-400 font-medium">/ 5</span>
            </div>
        </div>
    )
}

const ProgressBar = ({ score }: { score: number }) => {
    const percentage = (score / 5) * 100
    return (
        <div className="flex items-center gap-3">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#c2f34e] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-xs font-semibold text-slate-700 w-6 text-right">{score.toFixed(1)}</span>
        </div>
    )
}

export default function ReviewsPage() {
    const [filter, setFilter] = useState('Newest')

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-heading font-bold tracking-tight text-slate-900">Reviews</h1>
            </div>

            {/* TOP SECTION: Statistics & Overall Rating */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Statistics Chart */}
                <Card className="p-6 border-slate-200/60 shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-base font-semibold text-slate-800">Review Statistics</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 text-xs font-medium">
                                <span className="flex items-center gap-1.5 text-slate-500"><div className="w-2 h-2 rounded-full bg-[#c2f34e]"></div> Positive</span>
                                <span className="flex items-center gap-1.5 text-slate-500"><div className="w-2 h-2 rounded-full bg-slate-200"></div> Negative</span>
                            </div>
                            <Button variant="outline" size="sm" className="h-[30px] font-medium text-xs border-slate-200 bg-slate-50/50">
                                Last 7 Days <ChevronDown className="h-3 w-3 ml-1.5 opacity-50" />
                            </Button>
                        </div>
                    </div>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statisticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <RechartsTooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="positive" fill="#c2f34e" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                <Bar dataKey="negative" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Overall Rating */}
                <Card className="p-6 border-slate-200/60 shadow-sm rounded-2xl bg-white flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-base font-semibold text-slate-800">Overall Rating</h2>
                        <Button variant="outline" size="sm" className="h-[30px] font-medium text-xs border-slate-200 bg-slate-50/50">
                            This Week <ChevronDown className="h-3 w-3 ml-1.5 opacity-50" />
                        </Button>
                    </div>

                    <div className="flex-1 flex items-center gap-8">
                        <div className="flex flex-col items-center justify-center shrink-0">
                            <CircularScore score={4.6} total={5} />
                            <div className="bg-[#c2f34e]/20 text-slate-800 px-4 py-1.5 rounded-full text-xs font-bold mt-2 shadow-[0_2px_10px_rgba(194,243,78,0.2)]">
                                Impressive
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">from 2544 reviews</p>
                        </div>

                        <div className="flex-1 space-y-4">
                            {categories.map(cat => (
                                <div key={cat.name} className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-slate-500 w-24 truncate">{cat.name}</span>
                                    <div className="flex-1"><ProgressBar score={cat.score} /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* MIDDLE SECTION: Geography */}
            <Card className="p-6 border-slate-200/60 shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-slate-800">Reviews by Country</h2>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 items-center">
                    {/* Map Placeholder */}
                    <div className="flex-1 w-full flex items-center justify-center min-h-[300px]">
                        <WorldMapSVG
                            className="w-full max-w-[600px] h-auto drop-shadow-sm"
                            activeCountries={countries.map(c => c.code)}
                        />
                    </div>

                    {/* Country List */}
                    <div className="w-full lg:w-[350px] shrink-0">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Customers</span>
                            <span className="text-2xl font-heading font-bold text-slate-900">17,850</span>
                        </div>

                        <div className="space-y-4">
                            {countries.map(country => (
                                <div key={country.code} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-2 h-2 rounded-full bg-[#c2f34e] shadow-[0_0_8px_rgba(194,243,78,0.4)] group-hover:scale-150 transition-transform" />
                                        <span className="text-sm font-medium text-slate-600">{country.name}</span>
                                    </div>
                                    <span className="text-sm border pl-3 py-0.5 rounded-md font-bold text-slate-800 w-14 text-right">{country.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* BOTTOM SECTION: Customer Reviews */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-800">Customer Reviews</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500">Sort by:</span>
                        <Button variant="outline" size="sm" className="h-[30px] font-medium text-xs border-[#c2f34e] bg-[#c2f34e]/10 text-slate-800">
                            {filter} <ChevronDown className="h-3 w-3 ml-1.5 opacity-50" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reviews.map(review => (
                        <Card key={review.id} className="p-5 border-slate-200/60 shadow-sm rounded-2xl bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${review.avatar}&backgroundColor=f1f5f9`} alt={review.name} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 leading-tight mb-1">{review.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn("h-3 w-3", i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-400">{review.date}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed max-h-24 overflow-y-hidden relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-8 after:bg-gradient-to-t after:from-white after:to-transparent">
                                "{review.text}"
                            </p>
                        </Card>
                    ))}
                </div>
            </div>

        </div>
    )
}
