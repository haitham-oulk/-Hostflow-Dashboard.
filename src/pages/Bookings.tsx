import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Search, Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react'
import { formatMAD, formatShortDate } from '@/lib/utils'
import type { Booking, Guest, Task } from '@/mock/types'
import { CsvImportDialog } from '@/components/bookings/CsvImportDialog'
import { useBookingsContext } from '@/lib/useBookings'

export default function Bookings() {
    const { bookings, guests, importBookings } = useBookingsContext()

    const [search, setSearch] = useState('')
    const [platformFilter, setPlatformFilter] = useState('all')
    const [selected, setSelected] = useState<Booking | null>(null)
    const [csvOpen, setCsvOpen] = useState(false)

    const filtered = bookings.filter(b => {
        if (search && !b.guestName.toLowerCase().includes(search.toLowerCase())) return false
        if (platformFilter !== 'all' && b.platform !== platformFilter) return false
        return true
    })

    const handleCsvImport = useCallback((newBookings: Booking[], newGuests: Guest[], newTasks: Task[]) => {
        importBookings(newBookings, newGuests, newTasks)
    }, [importBookings])

    const getPayoutBadgeVariant = (status: string) => {
        if (status === 'received') return 'success' as const
        return 'warning' as const
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => setCsvOpen(true)}>
                        <Upload className="h-3.5 w-3.5" /> Import CSV
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search guest..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <Select value={platformFilter} onValueChange={setPlatformFilter}>
                            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Platform" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All platforms</SelectItem>
                                <SelectItem value="booking">Booking.com</SelectItem>
                                <SelectItem value="airbnb">Airbnb</SelectItem>
                                <SelectItem value="direct">Direct</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Guest</TableHead>
                                <TableHead>Platform</TableHead>
                                <TableHead>Check-in</TableHead>
                                <TableHead>Check-out</TableHead>
                                <TableHead>Nights</TableHead>
                                <TableHead>Net</TableHead>
                                <TableHead>Profit</TableHead>
                                <TableHead>Payout Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileSpreadsheet className="h-8 w-8" />
                                            <p className="text-sm font-medium">No bookings yet. Import your CSV.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map(b => (
                                    <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelected(b)}>
                                        <TableCell className="font-medium">{b.guestName}</TableCell>
                                        <TableCell><Badge variant={b.platform as 'booking' | 'airbnb' | 'direct'}>{b.platform}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{formatShortDate(b.checkIn)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{formatShortDate(b.checkOut)}</TableCell>
                                        <TableCell>{b.nights}</TableCell>
                                        <TableCell className="font-medium">{formatMAD(b.payoutAmount)}</TableCell>
                                        <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">{formatMAD(b.profit)}</TableCell>
                                        <TableCell><Badge variant={getPayoutBadgeVariant(b.payoutStatus)}>{b.payoutStatus}</Badge></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Detail Sheet */}
            <Sheet open={!!selected} onOpenChange={open => !open && setSelected(null)}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                    {selected && (
                        <>
                            <SheetHeader className="mb-6">
                                <div className="flex items-center justify-between">
                                    <SheetTitle className="text-xl">{selected.guestName}</SheetTitle>
                                    <Badge variant="outline" className="capitalize">{selected.platform}</Badge>
                                </div>
                                <SheetDescription>
                                    {formatShortDate(selected.checkIn)} → {formatShortDate(selected.checkOut)} ({selected.nights} nights)
                                </SheetDescription>
                            </SheetHeader>

                            <div className="space-y-8">
                                {/* Guest Info */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Guest Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground text-xs">Phone</p>
                                            <p className="font-medium">{selected.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Email</p>
                                            <p className="font-medium truncate">{selected.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Nationality</p>
                                            <p className="font-medium capitalize">{selected.nationality || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Guests</p>
                                            <p className="font-medium">{selected.guestsCount}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payout Info */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold">Financials</h3>
                                        <Badge variant={getPayoutBadgeVariant(selected.payoutStatus)}>
                                            {selected.payoutStatus}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-xl border">
                                        <div>
                                            <p className="text-muted-foreground text-xs">Total Payout</p>
                                            <p className="font-semibold text-base">{formatMAD(selected.payoutAmount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Net Profit</p>
                                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatMAD(selected.profit)}</p>
                                        </div>
                                        {selected.payoutStatus === 'expected' && selected.expectedPayoutDate && (
                                            <div className="col-span-2 mt-2 pt-2 border-t">
                                                <p className="text-muted-foreground text-xs">Expected By</p>
                                                <p className="font-medium">{formatShortDate(selected.expectedPayoutDate)}</p>
                                            </div>
                                        )}
                                    </div>
                                    {selected.payoutStatus === 'expected' && (
                                        <Button variant="outline" className="w-full mt-3 gap-2 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
                                            <CheckCircle2 className="h-4 w-4" /> Mark as Received
                                        </Button>
                                    )}
                                </div>

                                {/* Placeholder Documents */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Documents (Morocco Compliance)</h3>
                                    <div className="border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                                            <Upload className="h-5 w-5" />
                                        </div>
                                        <p className="font-medium text-sm">Upload Guest ID / Passport</p>
                                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Click or drag files here to upload required compliance documents.</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* CSV Dialog */}
            <CsvImportDialog open={csvOpen} onOpenChange={setCsvOpen} onImportComplete={handleCsvImport} existingGuests={guests} />
        </div>
    )
}
