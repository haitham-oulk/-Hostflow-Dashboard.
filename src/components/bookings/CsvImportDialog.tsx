import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { parseBookingsCsv, type CsvParseResult } from '@/lib/bookingUtils'
import type { Booking, Guest, Task } from '@/mock/types'

interface CsvImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImportComplete: (bookings: Booking[], guests: Guest[], tasks: Task[]) => void
    existingGuests: Guest[]
}

type Stage = 'upload' | 'preview' | 'done'

export function CsvImportDialog({ open, onOpenChange, onImportComplete, existingGuests }: CsvImportDialogProps) {
    const [stage, setStage] = useState<Stage>('upload')
    const [result, setResult] = useState<CsvParseResult | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const reset = () => {
        setStage('upload')
        setResult(null)
        if (fileRef.current) fileRef.current.value = ''
    }

    const handleClose = (open: boolean) => {
        if (!open) reset()
        onOpenChange(open)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            const parsed = parseBookingsCsv(text, existingGuests)
            setResult(parsed)
            setStage('preview')
        }
        reader.readAsText(file)
    }

    const handleConfirmImport = () => {
        if (!result || result.bookings.length === 0) return
        onImportComplete(result.bookings, result.guests, result.tasks)
        setStage('done')
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Import CSV</DialogTitle>
                    <DialogDescription>Upload a CSV file to bulk-import bookings.</DialogDescription>
                </DialogHeader>

                {/* Upload Stage */}
                {stage === 'upload' && (
                    <div className="py-6">
                        <div
                            className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => fileRef.current?.click()}
                        >
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium">Click to upload CSV</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Required columns: Hosted names, Phone, Email, Nationality, Number of guest, Platforme booked, Check-in, Check-out, Net
                                </p>
                            </div>
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>
                )}

                {/* Preview Stage */}
                {stage === 'preview' && result && (
                    <div className="space-y-4 py-2">
                        {result.errors.length > 0 && result.bookings.length === 0 ? (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-destructive">Import failed</p>
                                    {result.errors.map((err, i) => (
                                        <p key={i} className="text-xs text-destructive/80 mt-1">{err}</p>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                                    <FileSpreadsheet className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {result.importedCount} booking{result.importedCount !== 1 ? 's' : ''} ready to import
                                        </p>
                                        {result.skippedCount > 0 && (
                                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                {result.skippedCount} row{result.skippedCount !== 1 ? 's' : ''} will be skipped (missing required fields)
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Preview table */}
                                <div className="max-h-48 overflow-y-auto rounded-lg border">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-muted/50">
                                                <th className="px-3 py-2 text-left font-medium">Guest</th>
                                                <th className="px-3 py-2 text-left font-medium">Platform</th>
                                                <th className="px-3 py-2 text-left font-medium">Dates</th>
                                                <th className="px-3 py-2 text-right font-medium">Payout</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.bookings.slice(0, 10).map((b) => (
                                                <tr key={b.id} className="border-t">
                                                    <td className="px-3 py-1.5">{b.guestName}</td>
                                                    <td className="px-3 py-1.5 capitalize">{b.platform}</td>
                                                    <td className="px-3 py-1.5">{b.checkIn} → {b.checkOut}</td>
                                                    <td className="px-3 py-1.5 text-right">{b.payoutAmount} MAD</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {result.bookings.length > 10 && (
                                        <p className="text-xs text-muted-foreground text-center py-2">
                                            +{result.bookings.length - 10} more...
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => { reset(); }}>Cancel</Button>
                            {result.bookings.length > 0 && (
                                <Button onClick={handleConfirmImport}>
                                    Import {result.importedCount} Booking{result.importedCount !== 1 ? 's' : ''}
                                </Button>
                            )}
                        </DialogFooter>
                    </div>
                )}

                {/* Done Stage */}
                {stage === 'done' && result && (
                    <div className="py-6">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-base font-semibold">
                                    {result.importedCount} booking{result.importedCount !== 1 ? 's' : ''} imported successfully.
                                    {result.skippedCount > 0 && ` ${result.skippedCount} row${result.skippedCount !== 1 ? 's' : ''} skipped.`}
                                </p>
                            </div>
                            <Button className="mt-2" onClick={() => handleClose(false)}>Done</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
