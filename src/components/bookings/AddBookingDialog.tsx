import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createBookingFromInput, type BookingInput } from '@/lib/bookingUtils'
import type { Booking, Task, Platform, BookingStatus } from '@/mock/types'

interface AddBookingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onBookingCreated: (booking: Booking, task: Task) => void
}

const initialForm: BookingInput = {
    platform: 'booking',
    guestName: '',
    checkIn: '',
    checkOut: '',
    guestsCount: 2,
    payoutAmount: 0,
    status: 'confirmed',
}

export function AddBookingDialog({ open, onOpenChange, onBookingCreated }: AddBookingDialogProps) {
    const [form, setForm] = useState<BookingInput>({ ...initialForm })
    const [error, setError] = useState('')

    const update = <K extends keyof BookingInput>(key: K, value: BookingInput[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setError('')
    }

    const handleSave = () => {
        // Validate
        if (!form.guestName.trim()) return setError('Guest name is required.')
        if (!form.checkIn) return setError('Check-in date is required.')
        if (!form.checkOut) return setError('Check-out date is required.')
        if (form.checkOut <= form.checkIn) return setError('Check-out must be after check-in.')
        if (form.payoutAmount <= 0) return setError('Payout amount must be greater than 0.')

        const { booking, task } = createBookingFromInput(form)
        onBookingCreated(booking, task)
        setForm({ ...initialForm })
        setError('')
        onOpenChange(false)
    }

    const handleClose = (open: boolean) => {
        if (!open) {
            setForm({ ...initialForm })
            setError('')
        }
        onOpenChange(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Booking</DialogTitle>
                    <DialogDescription>Create a new booking with automatic payout and task generation.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Platform */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">Platform</Label>
                        <Select value={form.platform} onValueChange={(v) => update('platform', v as Platform)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="booking">Booking.com</SelectItem>
                                <SelectItem value="airbnb">Airbnb</SelectItem>
                                <SelectItem value="direct">Direct</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Guest Name */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">Guest Name</Label>
                        <Input
                            placeholder="e.g. Sophie Laurent"
                            value={form.guestName}
                            onChange={(e) => update('guestName', e.target.value)}
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Check-in</Label>
                            <Input
                                type="date"
                                value={form.checkIn}
                                onChange={(e) => update('checkIn', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Check-out</Label>
                            <Input
                                type="date"
                                value={form.checkOut}
                                onChange={(e) => update('checkOut', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Guests + Payout */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Number of Guests</Label>
                            <Input
                                type="number"
                                min={1}
                                value={form.guestsCount}
                                onChange={(e) => update('guestsCount', parseInt(e.target.value) || 1)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Total Payout (MAD)</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                value={form.payoutAmount || ''}
                                onChange={(e) => update('payoutAmount', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">Status</Label>
                        <Select value={form.status} onValueChange={(v) => update('status', v as BookingStatus)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Booking</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
