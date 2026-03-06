import { Building2, MapPin, BedDouble, Users, Star, Wifi, AirVent, Car } from 'lucide-react'

const AMENITIES = [
    { icon: Wifi, label: 'Wi-Fi inclus' },
    { icon: AirVent, label: 'Climatisation' },
    { icon: Car, label: 'Parking' },
    { icon: BedDouble, label: '2 chambres' },
]

export default function Properties() {
    return (
        <div className="space-y-6 pb-8 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Propriétés</h1>
                <p className="text-sm text-slate-500 mt-0.5">Votre bien locatif.</p>
            </div>

            {/* Single property card */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                {/* Cover image placeholder */}
                <div className="h-52 bg-gradient-to-br from-rose-100 via-orange-100 to-amber-100 flex items-center justify-center relative">
                    <Building2 className="h-16 w-16 text-rose-200" />
                    <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Actif
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Appartement Marrakech</h2>
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                                <MapPin className="h-4 w-4 text-rose-400" />
                                Marrakech, Maroc
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-bold text-slate-700">4.9</span>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            { icon: BedDouble, label: 'Chambres', value: '2' },
                            { icon: Users, label: 'Capacity', value: '4 pers.' },
                            { icon: Building2, label: 'Type', value: 'Appartement' },
                        ].map(item => (
                            <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
                                <item.icon className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                                <p className="text-xs text-slate-400">{item.label}</p>
                                <p className="text-sm font-bold text-slate-900">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Amenities */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Équipements</p>
                        <div className="flex flex-wrap gap-2">
                            {AMENITIES.map(a => (
                                <span key={a.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                                    <a.icon className="h-3.5 w-3.5 text-slate-400" />
                                    {a.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Financial footer */}
                <div className="px-6 pb-6">
                    <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-rose-400 font-medium">Prix de base / nuit</p>
                            <p className="text-2xl font-bold text-rose-600">1 700 MAD</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Frais de ménage</p>
                            <p className="text-lg font-bold text-slate-700">200 MAD</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
