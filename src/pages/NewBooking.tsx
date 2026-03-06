import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft, X, Users, Heart, Calendar, Building2,
    Check, UserPlus, Calculator
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'

interface AdditionalGuest {
    fullName: string
    nationality: string
    email: string
    phone: string
}

function formatMADLocal(value: number): string {
    return new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) + ' MAD'
}

export default function NewBooking() {
    const navigate = useNavigate()
    const { addBooking, properties } = useStore()
    const [saving, setSaving] = useState(false)
    const [step, setStep] = useState(1)

    const [form, setForm] = useState({
        source: 'direct' as 'airbnb' | 'booking' | 'direct',
        guestName: '',
        nationality: '',
        guestEmail: '',
        guestPhone: '',
        guestCount: 1,
        checkIn: '',
        checkOut: '',
        nightlyRate: 0,
        paymentStatus: 'pending',
        isCouple: false,
        specialRequests: '',
        reservationDate: new Date().toISOString().split('T')[0],
        bookingGeniusEnabled: false,
        bookingGeniusRate: 10,
    })

    const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([])

    const update = (field: string, value: unknown) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const nights = useMemo(() => {
        if (!form.checkIn || !form.checkOut) return 0
        const diff = new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }, [form.checkIn, form.checkOut])

    const pricing = useMemo(() => {
        const subtotal = form.nightlyRate * nights

        let platformFees = 0
        let geniusDiscount = 0

        switch (form.source) {
            case 'airbnb':
                platformFees = subtotal * 0.03
                break
            case 'booking':
                geniusDiscount = form.bookingGeniusEnabled
                    ? subtotal * (form.bookingGeniusRate / 100)
                    : 0
                const afterGenius = subtotal - geniusDiscount
                platformFees = afterGenius * 0.20 + afterGenius * 0.02
                break
            case 'direct':
                platformFees = 0
                break
        }

        const netAmount = subtotal - platformFees - geniusDiscount

        return {
            subtotal,
            platformFees: Math.round(platformFees * 100) / 100,
            geniusDiscount: Math.round(geniusDiscount * 100) / 100,
            netAmount: Math.round(netAmount * 100) / 100,
        }
    }, [form.nightlyRate, nights, form.source, form.bookingGeniusEnabled, form.bookingGeniusRate])

    const addGuest = () => {
        setAdditionalGuests(prev => [...prev, { fullName: '', nationality: '', email: '', phone: '' }])
        update('guestCount', form.guestCount + 1)
    }

    const updateGuest = (index: number, field: string, value: string) => {
        setAdditionalGuests(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g))
    }

    const removeGuest = (index: number) => {
        setAdditionalGuests(prev => prev.filter((_, i) => i !== index))
        update('guestCount', Math.max(1, form.guestCount - 1))
    }

    const handleSubmit = async () => {
        if (!form.guestName || !form.checkIn || !form.checkOut || form.nightlyRate <= 0) {
            alert('Veuillez remplir tous les champs obligatoires')
            return
        }

        setSaving(true)
        try {
            await addBooking({
                propertyId: properties[0]?.id || null,
                guestName: form.guestName,
                nationality: form.nationality,
                guestEmail: form.guestEmail,
                guestPhone: form.guestPhone,
                guestCount: form.guestCount,
                source: form.source,
                checkIn: form.checkIn,
                checkOut: form.checkOut,
                nights,
                nightlyRate: form.nightlyRate,
                totalAmount: pricing.subtotal,
                platformFees: pricing.platformFees + pricing.geniusDiscount,
                netAmount: pricing.netAmount,
                paymentStatus: form.paymentStatus,
                reservationDate: form.reservationDate,
                isCouple: form.isCouple,
                specialRequests: form.specialRequests,
                additionalGuests,
                status: 'confirmed',
            })
            navigate('/bookings')
        } catch (error) {
            console.error('Error creating booking:', error)
            alert('Erreur lors de la création')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Nouvelle réservation</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Ajouter manuellement une réservation</p>
                </div>
            </div>

            {/* Steps */}
            <div className="flex items-center gap-2">
                {[
                    { n: 1, label: 'Plateforme & Source' },
                    { n: 2, label: 'Voyageurs' },
                    { n: 3, label: 'Dates & Tarifs' },
                ].map((s, i) => (
                    <div key={s.n} className="flex items-center gap-2">
                        <button
                            onClick={() => setStep(s.n)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                step === s.n
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : step > s.n
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-100 text-slate-500'
                            )}>
                            {step > s.n ? <Check className="w-4 h-4" /> : null}
                            {s.label}
                        </button>
                        {i < 2 && <div className="w-8 h-px bg-slate-200" />}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MAIN FORM */}
                <div className="lg:col-span-2 space-y-5">

                    {/* STEP 1: Source */}
                    {step === 1 && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-500" />
                                Plateforme
                            </h2>

                            {/* Source */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    Plateforme <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { val: 'airbnb', label: 'Airbnb', emoji: '🏡', cls: form.source === 'airbnb' ? 'border-rose-300 bg-rose-50 text-rose-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50' },
                                        { val: 'booking', label: 'Booking.com', emoji: '🏨', cls: form.source === 'booking' ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50' },
                                        { val: 'direct', label: 'Directe', emoji: '✨', cls: form.source === 'direct' ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50' },
                                    ].map(s => (
                                        <button key={s.val}
                                            onClick={() => update('source', s.val)}
                                            className={cn(
                                                'flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all',
                                                s.cls
                                            )}>
                                            <span className="text-2xl">{s.emoji}</span>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Booking Genius */}
                            {form.source === 'booking' && (
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-blue-700">Programme Genius</p>
                                            <p className="text-xs text-blue-500 mt-0.5">Réduction voyageur Genius</p>
                                        </div>
                                        <div
                                            onClick={() => update('bookingGeniusEnabled', !form.bookingGeniusEnabled)}
                                            className={cn(
                                                'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                                                form.bookingGeniusEnabled ? 'bg-blue-600' : 'bg-slate-300'
                                            )}>
                                            <div className={cn(
                                                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                                                form.bookingGeniusEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                                            )} />
                                        </div>
                                    </div>
                                    {form.bookingGeniusEnabled && (
                                        <div className="flex gap-2 mt-3">
                                            {[10, 15].map(r => (
                                                <button key={r}
                                                    onClick={() => update('bookingGeniusRate', r)}
                                                    className={cn(
                                                        'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
                                                        form.bookingGeniusRate === r
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-blue-200 text-blue-600 hover:bg-blue-100'
                                                    )}>
                                                    -{r}%
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reservation date */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Date de réservation</label>
                                <input type="date" value={form.reservationDate}
                                    onChange={(e) => update('reservationDate', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                                />
                            </div>

                            <button onClick={() => setStep(2)}
                                className="w-full py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                                Suivant: Voyageurs →
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Guests */}
                    {step === 2 && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                Informations voyageurs
                            </h2>

                            {/* Main Guest */}
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                                <p className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md inline-block">
                                    Voyageur principal
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">
                                            Nom complet <span className="text-red-500">*</span>
                                        </label>
                                        <input type="text" value={form.guestName}
                                            onChange={(e) => update('guestName', e.target.value)}
                                            placeholder="Nom et prénom"
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Nationalité</label>
                                        <input type="text" value={form.nationality}
                                            onChange={(e) => update('nationality', e.target.value)}
                                            placeholder="Ex: Française"
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Email</label>
                                        <input type="email" value={form.guestEmail}
                                            onChange={(e) => update('guestEmail', e.target.value)}
                                            placeholder="email@example.com"
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Téléphone</label>
                                        <input type="tel" value={form.guestPhone}
                                            onChange={(e) => update('guestPhone', e.target.value)}
                                            placeholder="+33 6 12 34 56 78"
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Couple toggle */}
                            <div className="flex items-center justify-between p-4 bg-pink-50/50 rounded-xl border border-pink-100">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-pink-500" />
                                    <span className="text-sm font-medium text-slate-700">C'est un couple?</span>
                                    <span className="text-xs text-slate-400">(certificat de mariage requis)</span>
                                </div>
                                <div
                                    onClick={() => update('isCouple', !form.isCouple)}
                                    className={cn(
                                        'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                                        form.isCouple ? 'bg-pink-500' : 'bg-slate-300'
                                    )}>
                                    <div className={cn(
                                        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                                        form.isCouple ? 'translate-x-[22px]' : 'translate-x-0.5'
                                    )} />
                                </div>
                            </div>

                            {/* Additional Guests */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-slate-700">Voyageurs supplémentaires</label>
                                    <button onClick={addGuest}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors">
                                        <UserPlus className="w-3.5 h-3.5" />
                                        Ajouter
                                    </button>
                                </div>

                                {additionalGuests.map((guest, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-xl mb-3 relative">
                                        <button onClick={() => removeGuest(idx)}
                                            className="absolute top-2 right-2 p-1 rounded-lg hover:bg-red-100 transition-colors">
                                            <X className="w-4 h-4 text-red-400" />
                                        </button>
                                        <p className="text-xs font-medium text-slate-400 mb-3">Voyageur {idx + 2}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <input type="text" value={guest.fullName}
                                                onChange={(e) => updateGuest(idx, 'fullName', e.target.value)}
                                                placeholder="Nom complet"
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            />
                                            <input type="text" value={guest.nationality}
                                                onChange={(e) => updateGuest(idx, 'nationality', e.target.value)}
                                                placeholder="Nationalité"
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>
                                ))}

                                {additionalGuests.length === 0 && (
                                    <p className="text-xs text-slate-400 text-center py-4">Aucun voyageur supplémentaire</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors">
                                    ← Retour
                                </button>
                                <button onClick={() => setStep(3)} disabled={!form.guestName}
                                    className="flex-1 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-sm">
                                    Suivant: Dates →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Dates & Pricing */}
                    {step === 3 && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                Dates & Tarification
                            </h2>

                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-600 mb-1 block">
                                        Check-in <span className="text-red-500">*</span>
                                    </label>
                                    <input type="date" value={form.checkIn}
                                        onChange={(e) => update('checkIn', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 mb-1 block">
                                        Check-out <span className="text-red-500">*</span>
                                    </label>
                                    <input type="date" value={form.checkOut}
                                        min={form.checkIn}
                                        onChange={(e) => update('checkOut', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            {nights > 0 && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium">{nights} nuit{nights > 1 ? 's' : ''}</span>
                                </div>
                            )}

                            {/* Price per night */}
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">
                                    Prix par nuit (MAD) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input type="number" value={form.nightlyRate || ''}
                                        onChange={(e) => update('nightlyRate', Number(e.target.value))}
                                        placeholder="0"
                                        className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">MAD</span>
                                </div>
                            </div>

                            {/* Special requests */}
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Notes / Demandes spéciales</label>
                                <textarea value={form.specialRequests}
                                    onChange={(e) => update('specialRequests', e.target.value)}
                                    rows={2} placeholder="Ex: Arrivée tardive à 23h..."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors">
                                    ← Retour
                                </button>
                                <button onClick={handleSubmit}
                                    disabled={saving || !form.checkIn || !form.checkOut || form.nightlyRate <= 0}
                                    className="flex-1 py-3 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm transition-colors">
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Création...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Créer la réservation
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Live Summary */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-20 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-blue-500" />
                            Récapitulatif
                        </h3>

                        <div className="space-y-3 text-sm">
                            {/* Source */}
                            <div className="flex justify-between">
                                <span className="text-slate-500">Plateforme</span>
                                <span className={cn(
                                    'text-xs font-semibold px-2 py-0.5 rounded-md capitalize',
                                    form.source === 'airbnb' ? 'bg-rose-50 text-rose-700' :
                                    form.source === 'booking' ? 'bg-blue-50 text-blue-700' :
                                    'bg-emerald-50 text-emerald-700'
                                )}>
                                    {form.source === 'booking' ? 'Booking.com' : form.source}
                                </span>
                            </div>

                            {/* Guest */}
                            {form.guestName && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Voyageur</span>
                                    <span className="text-slate-800 font-medium">{form.guestName}</span>
                                </div>
                            )}

                            {form.nationality && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Nationalité</span>
                                    <span className="text-slate-700">{form.nationality}</span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-slate-500">Voyageurs</span>
                                <span className="text-slate-800 font-medium">{form.guestCount}</span>
                            </div>

                            {/* Dates */}
                            {nights > 0 && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Nuits</span>
                                        <span className="text-slate-800 font-medium">{nights}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Séjour</span>
                                        <span className="text-slate-700 text-xs">{form.checkIn} → {form.checkOut}</span>
                                    </div>
                                </>
                            )}

                            {/* Pricing */}
                            {form.nightlyRate > 0 && nights > 0 && (
                                <>
                                    <div className="border-t border-slate-100 pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">{formatMADLocal(form.nightlyRate)} × {nights} nuits</span>
                                            <span className="font-medium text-slate-800">{formatMADLocal(pricing.subtotal)}</span>
                                        </div>
                                    </div>

                                    {pricing.geniusDiscount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Genius (-{form.bookingGeniusRate}%)</span>
                                            <span className="font-medium text-amber-600">-{formatMADLocal(pricing.geniusDiscount)}</span>
                                        </div>
                                    )}

                                    {pricing.platformFees > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Commission plateforme</span>
                                            <span className="font-medium text-red-500">-{formatMADLocal(pricing.platformFees)}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-slate-100 pt-3 flex justify-between">
                                        <span className="font-semibold text-slate-800">Revenu net</span>
                                        <span className="text-xl font-bold text-emerald-600">{formatMADLocal(pricing.netAmount)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
