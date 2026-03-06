import { useState, useEffect, useMemo } from 'react'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Loader2, TrendingDown, Sparkles } from 'lucide-react'
import { calcCommissionPct, calcNetPayout, CLEANING_COST } from '@/lib/bookingUtils'
import type { Booking } from '@/mock/types'

interface NewBookingInput {
    guestName: string
    platform: 'airbnb' | 'booking' | 'direct'
    checkIn: string
    checkOut: string
    grossPrice: number
    numGuests: number
}

interface BookingFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** If provided, the form is in Edit mode */
    booking?: Booking | null
    onSubmit: (input: NewBookingInput) => Promise<void>
}

const PLATFORM_LABELS: Record<string, string> = {
    airbnb: 'Airbnb',
    booking: 'Booking.com',
    direct: 'Direct',
}

function toDateInputValue(iso: string | undefined): string {
    if (!iso) return ''
    return iso.slice(0, 10)
}

export function BookingFormModal({ open, onOpenChange, booking, onSubmit }: BookingFormModalProps) {
    const isEdit = !!booking

    const [guestName, setGuestName] = useState('')
    const [platform, setPlatform] = useState<'airbnb' | 'booking' | 'direct'>('airbnb')
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [grossPrice, setGrossPrice] = useState('')
    const [numGuests, setNumGuests] = useState('1')
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    // Pre-fill when editing
    useEffect(() => {
        if (open && booking) {
            setGuestName(booking.guestName)
            setPlatform(booking.platform as 'airbnb' | 'booking' | 'direct')
            setCheckIn(toDateInputValue(booking.checkIn))
            setCheckOut(toDateInputValue(booking.checkOut))
            setGrossPrice(String(booking.payoutAmount > 0 ? Math.round(booking.payoutAmount / (1 - calcCommissionPct(booking.platform) / 100)) : ''))
            setNumGuests(String(booking.guestsCount))
        } else if (open && !booking) {
            setGuestName('')
            setPlatform('airbnb')
            setCheckIn('')
            setCheckOut('')
            setGrossPrice('')
            setNumGuests('1')
        }
        setFormError(null)
    }, [open, booking])

    // ── Live calc ──────────────────────────────────────────────────────────
    const commPct = calcCommissionPct(platform)
    const gross = useMemo(() => parseFloat(grossPrice) || 0, [grossPrice])
    const commissionMAD = useMemo(() => gross * commPct / 100, [gross, commPct])
    const netPayout = useMemo(() => calcNetPayout(gross, commPct), [gross, commPct])

    const nights = useMemo(() => {
        if (!checkIn || !checkOut) return 0
        const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
        return Math.max(0, Math.round(diff))
    }, [checkIn, checkOut])

    // ── Submit ─────────────────────────────────────────────────────────────
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setFormError(null)

        if (!guestName.trim()) return setFormError("Le nom du client est requis.")
        if (!checkIn) return setFormError("La date d'arrivée est requise.")
        if (!checkOut) return setFormError("La date de départ est requise.")
        if (checkOut <= checkIn) return setFormError("La date de départ doit être après l'arrivée.")
        if (gross <= 0) return setFormError("Le montant brut doit être supérieur à 0.")

        setSubmitting(true)
        try {
            await onSubmit({
                guestName: guestName.trim(),
                platform,
                checkIn,
                checkOut,
                grossPrice: gross,
                numGuests: parseInt(numGuests) || 1,
            })
            onOpenChange(false)
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'Une erreur est survenue.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {isEdit ? 'Modifier la réservation' : 'Nouvelle réservation'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {isEdit ? 'Mettez à jour les informations ci-dessous.' : 'Remplissez le formulaire. Le net et la commission sont calculés automatiquement.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    {/* Guest Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="bf-guest-name">Nom du client</Label>
                        <Input
                            id="bf-guest-name"
                            placeholder="Ex: Mohammed Alami"
                            value={guestName}
                            onChange={e => setGuestName(e.target.value)}
                        />
                    </div>

                    {/* Platform */}
                    <div className="space-y-1.5">
                        <Label htmlFor="bf-platform">Plateforme</Label>
                        <Select value={platform} onValueChange={v => setPlatform(v as typeof platform)}>
                            <SelectTrigger id="bf-platform">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="airbnb">Airbnb (−3%)</SelectItem>
                                <SelectItem value="booking">Booking.com (−15%)</SelectItem>
                                <SelectItem value="direct">Direct (0%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="bf-check-in">Arrivée</Label>
                            <Input
                                id="bf-check-in"
                                type="date"
                                value={checkIn}
                                onChange={e => setCheckIn(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="bf-check-out">Départ</Label>
                            <Input
                                id="bf-check-out"
                                type="date"
                                value={checkOut}
                                onChange={e => setCheckOut(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Financials row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="bf-gross">Montant brut (MAD)</Label>
                            <Input
                                id="bf-gross"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="1200"
                                value={grossPrice}
                                onChange={e => setGrossPrice(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="bf-num-guests">Voyageurs</Label>
                            <Input
                                id="bf-num-guests"
                                type="number"
                                min="1"
                                max="20"
                                placeholder="1"
                                value={numGuests}
                                onChange={e => setNumGuests(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Live financial preview */}
                    {gross > 0 && (
                        <div className="bg-muted/40 border rounded-xl p-4 space-y-2.5 text-sm">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                <TrendingDown className="h-3.5 w-3.5" />
                                Calcul automatique
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Montant brut</span>
                                <span className="font-medium">{gross.toLocaleString('fr-MA')} MAD</span>
                            </div>
                            <div className="flex justify-between text-red-500 dark:text-red-400">
                                <span>Commission {PLATFORM_LABELS[platform]} ({commPct}%)</span>
                                <span>−{commissionMAD.toFixed(0)} MAD</span>
                            </div>
                            <div className="flex justify-between text-amber-600 dark:text-amber-400">
                                <span>Frais de ménage</span>
                                <span>−{CLEANING_COST} MAD</span>
                            </div>
                            {nights > 0 && (
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Durée</span>
                                    <span>{nights} nuit{nights > 1 ? 's' : ''}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-bold text-base text-emerald-600 dark:text-emerald-400">
                                <span>Net encaissé</span>
                                <span>{netPayout.toFixed(0)} MAD</span>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {formError && (
                        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                            {formError}
                        </p>
                    )}

                    <DialogFooter className="pt-1">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={submitting} className="gap-2">
                            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {isEdit ? 'Enregistrer' : 'Créer la réservation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
