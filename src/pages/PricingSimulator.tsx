import { useState, useMemo, useEffect } from 'react'
import {
    Calculator, ArrowRight, Info, Sparkles,
    RefreshCw, Globe, ArrowUpDown, TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DEFAULT_EUR_MAD = 10.85

function formatMADLocal(value: number): string {
    return new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) + ' MAD'
}

export default function PricingSimulator() {
    const [mode, setMode] = useState<'net_to_price' | 'price_to_net'>('net_to_price')
    const [inputAmount, setInputAmount] = useState(3000)
    const [nights, setNights] = useState(5)
    const [geniusEnabled, setGeniusEnabled] = useState(false)
    const [geniusRate, setGeniusRate] = useState(10)

    const [eurMadRate, setEurMadRate] = useState(DEFAULT_EUR_MAD)
    const [rateLoading, setRateLoading] = useState(false)
    const [rateLastUpdate, setRateLastUpdate] = useState('')
    const [showConverter, setShowConverter] = useState(false)
    const [convertAmount, setConvertAmount] = useState(100)
    const [convertDirection, setConvertDirection] = useState<'eur_to_mad' | 'mad_to_eur'>('eur_to_mad')

    const fetchExchangeRate = async () => {
        setRateLoading(true)
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/EUR')
            const data = await res.json()
            if (data.rates?.MAD) {
                setEurMadRate(data.rates.MAD)
                setRateLastUpdate(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
            }
        } catch {
            setRateLastUpdate('Taux par défaut')
        }
        setRateLoading(false)
    }

    useEffect(() => {
        fetchExchangeRate()
    }, [])

    const results = useMemo(() => {
        if (mode === 'net_to_price') {
            const desiredNet = inputAmount

            // AIRBNB: net = price - (price * 0.03) → price = net / 0.97
            const airbnbPrice = desiredNet / 0.97
            const airbnbPerNight = airbnbPrice / nights
            const airbnbFees = airbnbPrice - desiredNet

            // BOOKING: depends on Genius
            let bookingMultiplier = 0.78
            if (geniusEnabled) {
                bookingMultiplier = (1 - geniusRate / 100) * 0.78
            }
            const bookingPrice = desiredNet / bookingMultiplier
            const bookingPerNight = bookingPrice / nights
            const bookingGeniusAmount = geniusEnabled ? bookingPrice * (geniusRate / 100) : 0
            const bookingAfterGenius = bookingPrice - bookingGeniusAmount
            const bookingCommission = bookingAfterGenius * 0.20
            const bookingPayment = bookingAfterGenius * 0.02
            const bookingPriceEUR = bookingPrice / eurMadRate
            const bookingPerNightEUR = bookingPerNight / eurMadRate

            return {
                airbnb: {
                    priceToSet: Math.ceil(airbnbPerNight),
                    totalPrice: Math.ceil(airbnbPrice),
                    fees: Math.round(airbnbFees * 100) / 100,
                    feePct: 3,
                    netAmount: desiredNet,
                },
                booking: {
                    priceToSet: Math.ceil(bookingPerNightEUR * 100) / 100,
                    priceToSetMAD: Math.ceil(bookingPerNight),
                    totalPrice: Math.ceil(bookingPrice),
                    totalPriceEUR: Math.round(bookingPriceEUR * 100) / 100,
                    fees: Math.round((bookingGeniusAmount + bookingCommission + bookingPayment) * 100) / 100,
                    geniusAmount: Math.round(bookingGeniusAmount * 100) / 100,
                    commission: Math.round(bookingCommission * 100) / 100,
                    paymentFee: Math.round(bookingPayment * 100) / 100,
                    netAmount: desiredNet,
                },
                direct: {
                    priceToSet: Math.ceil(desiredNet / nights),
                    totalPrice: desiredNet,
                    fees: 0,
                    netAmount: desiredNet,
                },
            }
        } else {
            const pricePerNight = inputAmount
            const subtotal = pricePerNight * nights

            const airbnbFees = subtotal * 0.03
            const airbnbNet = subtotal - airbnbFees

            const geniusDiscount = geniusEnabled ? subtotal * (geniusRate / 100) : 0
            const afterGenius = subtotal - geniusDiscount
            const bookingCommission = afterGenius * 0.20
            const bookingPayment = afterGenius * 0.02
            const bookingNet = afterGenius - bookingCommission - bookingPayment

            return {
                airbnb: {
                    priceToSet: pricePerNight,
                    totalPrice: subtotal,
                    fees: Math.round(airbnbFees * 100) / 100,
                    feePct: 3,
                    netAmount: Math.round(airbnbNet * 100) / 100,
                },
                booking: {
                    priceToSet: Math.round((pricePerNight / eurMadRate) * 100) / 100,
                    priceToSetMAD: pricePerNight,
                    totalPrice: subtotal,
                    totalPriceEUR: Math.round((subtotal / eurMadRate) * 100) / 100,
                    fees: Math.round((geniusDiscount + bookingCommission + bookingPayment) * 100) / 100,
                    geniusAmount: Math.round(geniusDiscount * 100) / 100,
                    commission: Math.round(bookingCommission * 100) / 100,
                    paymentFee: Math.round(bookingPayment * 100) / 100,
                    netAmount: Math.round(bookingNet * 100) / 100,
                },
                direct: {
                    priceToSet: pricePerNight,
                    totalPrice: subtotal,
                    fees: 0,
                    netAmount: subtotal,
                },
            }
        }
    }, [inputAmount, nights, mode, geniusEnabled, geniusRate, eurMadRate])

    const convertedAmount = useMemo(() => {
        if (convertDirection === 'eur_to_mad') return convertAmount * eurMadRate
        return convertAmount / eurMadRate
    }, [convertAmount, convertDirection, eurMadRate])

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-blue-500" />
                        Simulateur de Prix
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Calculez le prix à afficher sur chaque plateforme
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setShowConverter(!showConverter)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-blue-300 transition-all shadow-sm">
                        <Globe className="w-4 h-4 text-blue-500" />
                        1 EUR = {eurMadRate.toFixed(2)} MAD
                    </button>
                    <button onClick={fetchExchangeRate}
                        className={cn(
                            'p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-all shadow-sm',
                            rateLoading && 'opacity-60'
                        )}>
                        <RefreshCw className={cn('w-4 h-4 text-slate-500', rateLoading && 'animate-spin')} />
                    </button>
                </div>
            </div>

            {/* Currency Converter */}
            {showConverter && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Convertisseur EUR ↔ MAD
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className="text-xs text-blue-600 mb-1 block font-medium">
                                {convertDirection === 'eur_to_mad' ? 'EUR (€)' : 'MAD (DH)'}
                            </label>
                            <input type="number" value={convertAmount}
                                onChange={(e) => setConvertAmount(Number(e.target.value))}
                                className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <button onClick={() => setConvertDirection(d => d === 'eur_to_mad' ? 'mad_to_eur' : 'eur_to_mad')}
                            className="p-2.5 bg-white rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors mt-5">
                            <ArrowUpDown className="w-5 h-5 text-blue-600" />
                        </button>
                        <div className="flex-1">
                            <label className="text-xs text-blue-600 mb-1 block font-medium">
                                {convertDirection === 'eur_to_mad' ? 'MAD (DH)' : 'EUR (€)'}
                            </label>
                            <div className="w-full px-4 py-2.5 bg-blue-600 rounded-xl text-lg font-bold text-white">
                                {convertedAmount.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <p className="text-[11px] text-blue-400 mt-2">
                        Taux XE: 1 EUR = {eurMadRate.toFixed(4)} MAD
                        {rateLastUpdate && ` · Mis à jour à ${rateLastUpdate}`}
                    </p>
                </div>
            )}

            {/* Mode Switch */}
            <div className="bg-white rounded-2xl border border-slate-100 p-1.5 flex gap-1.5 shadow-sm">
                <button onClick={() => setMode('net_to_price')}
                    className={cn(
                        'flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2',
                        mode === 'net_to_price'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                    )}>
                    <TrendingUp className="w-4 h-4" />
                    Net souhaité → Prix à afficher
                </button>
                <button onClick={() => setMode('price_to_net')}
                    className={cn(
                        'flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2',
                        mode === 'price_to_net'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                    )}>
                    <Calculator className="w-4 h-4" />
                    Prix affiché → Net reçu
                </button>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            {mode === 'net_to_price' ? '💰 Net souhaité (MAD total)' : '💰 Prix par nuit (MAD)'}
                        </label>
                        <div className="relative">
                            <input type="number" value={inputAmount}
                                onChange={(e) => setInputAmount(Number(e.target.value))}
                                className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">MAD</span>
                        </div>
                        <input type="range" min={100} max={20000} step={100} value={inputAmount}
                            onChange={(e) => setInputAmount(Number(e.target.value))}
                            className="w-full mt-2 accent-blue-600" />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">📅 Nombre de nuits</label>
                        <input type="number" value={nights} min={1} max={365}
                            onChange={(e) => setNights(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        {mode === 'net_to_price' && (
                            <p className="text-xs text-slate-400 mt-2">
                                Net par nuit: {formatMADLocal(inputAmount / nights)}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">🏨 Genius (Booking)</label>
                        <div className="space-y-3">
                            <div
                                onClick={() => setGeniusEnabled(!geniusEnabled)}
                                className={cn(
                                    'flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all',
                                    geniusEnabled ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                                )}>
                                <span className="text-sm text-slate-700">{geniusEnabled ? 'Activé' : 'Désactivé'}</span>
                                <div className={cn('w-10 h-5 rounded-full transition-colors relative', geniusEnabled ? 'bg-blue-600' : 'bg-slate-300')}>
                                    <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', geniusEnabled ? 'translate-x-5' : 'translate-x-0.5')} />
                                </div>
                            </div>
                            {geniusEnabled && (
                                <div className="flex gap-2">
                                    {[10, 15].map(r => (
                                        <button key={r} onClick={() => setGeniusRate(r)}
                                            className={cn(
                                                'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
                                                geniusRate === r ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500'
                                            )}>
                                            -{r}%
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* AIRBNB */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-xl shadow-sm">🏡</div>
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900">Airbnb</h3>
                            <p className="text-xs text-slate-400">3% frais hôte</p>
                        </div>
                    </div>

                    <div className="space-y-2.5 mb-4">
                        {mode === 'net_to_price' ? (
                            <>
                                <div className="p-3 bg-rose-50 rounded-xl text-center">
                                    <p className="text-xs text-rose-600 font-medium mb-1">Prix à afficher / nuit</p>
                                    <p className="text-2xl font-bold text-rose-700">{formatMADLocal(results.airbnb.priceToSet)}</p>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Total ({nights} nuits)</span>
                                    <span className="font-medium">{formatMADLocal(results.airbnb.totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Commission (3%)</span>
                                    <span className="text-red-500">-{formatMADLocal(results.airbnb.fees)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between">
                                    <span className="text-sm font-semibold">Vous recevez</span>
                                    <span className="text-lg font-bold text-emerald-600">{formatMADLocal(results.airbnb.netAmount)}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{formatMADLocal(inputAmount)} × {nights}</span>
                                    <span className="font-medium">{formatMADLocal(results.airbnb.totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Commission (3%)</span>
                                    <span className="text-red-500">-{formatMADLocal(results.airbnb.fees)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between">
                                    <span className="text-sm font-semibold">Net reçu</span>
                                    <span className="text-lg font-bold text-emerald-600">{formatMADLocal(results.airbnb.netAmount)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* BOOKING.COM */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-sm">🏨</div>
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900">Booking.com</h3>
                            <p className="text-xs text-slate-400">20% + 2% + Genius</p>
                        </div>
                    </div>

                    <div className="space-y-2.5 mb-4">
                        {mode === 'net_to_price' && (
                            <div className="p-3 bg-blue-50 rounded-xl text-center">
                                <p className="text-xs text-blue-600 font-medium mb-1">Prix à afficher / nuit</p>
                                <p className="text-2xl font-bold text-blue-700">€{results.booking.priceToSet.toFixed(2)}</p>
                                <p className="text-xs text-blue-400 mt-0.5">≈ {formatMADLocal(results.booking.priceToSetMAD)}</p>
                            </div>
                        )}

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Total</span>
                            <span className="font-medium">
                                {formatMADLocal(results.booking.totalPrice)}
                                <span className="text-xs text-slate-400 ml-1">(€{results.booking.totalPriceEUR})</span>
                            </span>
                        </div>

                        {results.booking.geniusAmount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Genius (-{geniusRate}%)</span>
                                <span className="text-amber-600">-{formatMADLocal(results.booking.geniusAmount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Commission (20%)</span>
                            <span className="text-red-500">-{formatMADLocal(results.booking.commission)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Frais paiement (2%)</span>
                            <span className="text-red-500">-{formatMADLocal(results.booking.paymentFee)}</span>
                        </div>

                        <div className="border-t pt-2 flex justify-between">
                            <span className="text-sm font-semibold">
                                {mode === 'net_to_price' ? 'Vous recevez' : 'Net reçu'}
                            </span>
                            <span className="text-lg font-bold text-emerald-600">{formatMADLocal(results.booking.netAmount)}</span>
                        </div>
                    </div>

                    <div className="text-[11px] text-blue-400 bg-blue-50/50 rounded-lg p-2 text-center">
                        💡 Paiement chaque jeudi après checkout
                    </div>
                </div>

                {/* DIRECT */}
                <div className="bg-white rounded-2xl border border-emerald-200 p-5 hover:shadow-md transition-all relative shadow-sm">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-sm">
                        <Sparkles className="w-3 h-3" /> Meilleur revenu
                    </div>

                    <div className="flex items-center gap-3 mb-5 mt-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shadow-sm">✨</div>
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900">Réservation Directe</h3>
                            <p className="text-xs text-emerald-600 font-medium">0% commission</p>
                        </div>
                    </div>

                    <div className="space-y-2.5 mb-4">
                        {mode === 'net_to_price' && (
                            <div className="p-3 bg-emerald-50 rounded-xl text-center">
                                <p className="text-xs text-emerald-600 font-medium mb-1">Prix à afficher / nuit</p>
                                <p className="text-2xl font-bold text-emerald-700">{formatMADLocal(results.direct.priceToSet)}</p>
                            </div>
                        )}

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Total</span>
                            <span className="font-medium">{formatMADLocal(results.direct.totalPrice)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Commission</span>
                            <span className="font-medium text-emerald-600">0 MAD ✨</span>
                        </div>

                        <div className="border-t pt-2 flex justify-between">
                            <span className="text-sm font-semibold">
                                {mode === 'net_to_price' ? 'Vous recevez' : 'Net reçu'}
                            </span>
                            <span className="text-lg font-bold text-emerald-600">{formatMADLocal(results.direct.netAmount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 flex items-start gap-3 shadow-sm">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Mode "{mode === 'net_to_price' ? 'Net → Prix' : 'Prix → Net'}"</strong>:
                        {mode === 'net_to_price'
                            ? ' Entrez le montant net que vous souhaitez recevoir, le simulateur calcule le prix à afficher sur chaque plateforme.'
                            : ' Entrez le prix par nuit, le simulateur calcule votre revenu net sur chaque plateforme.'}
                    </p>
                    <p>💱 <strong>Taux EUR/MAD</strong>: mis à jour via XE. Booking.com effectue toutes les transactions en euros.</p>
                </div>
            </div>
        </div>
    )
}
