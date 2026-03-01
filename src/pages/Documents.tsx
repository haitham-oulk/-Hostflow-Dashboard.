import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, FileText } from 'lucide-react'
import { useBookingsContext } from '@/lib/useBookings'

export default function Documents() {
    const { bookings } = useBookingsContext()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
                <p className="text-sm text-muted-foreground">Moroccan compliance — guest IDs and marriage certificates</p>
            </div>

            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Moroccan Compliance Requirements</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">All guests must provide a valid ID (front + back). Couples must provide a marriage certificate.</p>
                </div>
            </div>

            {bookings.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <FileText className="h-12 w-12 mb-3" />
                        <p className="text-sm font-medium text-foreground">No bookings yet</p>
                        <p className="text-xs mt-1">Import bookings to manage guest documents.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <FileText className="h-12 w-12 mb-3" />
                        <p className="text-sm font-medium text-foreground">Document management coming soon</p>
                        <p className="text-xs mt-1">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} loaded. Document upload will be available in a future update.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
