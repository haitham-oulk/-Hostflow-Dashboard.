import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    Search, Upload, FileSpreadsheet, CheckCircle2,
    Plus, Pencil, Trash2, Loader2, AlertCircle,
} from 'lucide-react'
import { formatMAD } from '@/lib/utils'
import type { Booking, Guest, Task } from '@/mock/types'
import { CsvImportDialog } from '@/components/bookings/CsvImportDialog'
import { BookingFormModal } from '@/components/bookings/BookingFormModal'
import { useStore } from '@/lib/store'

export default function Bookings() {
    const {
        bookings, loading,
        addBooking, updateBooking,
    } = useStore()

    const formatShortDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : ''

    const [search, setSearch] = useState('')
    const [platformFilter, setPlatformFilter] = useState('all')

    // Detail sheet
    const [selected, setSelected] = useState<any>(null)

    // CSV import
    const [csvOpen, setCsvOpen] = useState(false)

    // Add / Edit modal
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<any>(null)

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<any>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const filtered = bookings.filter((b: any) => {
        if (search && !b.guestName.toLowerCase().includes(search.toLowerCase())) return false
        if (platformFilter !== 'all' && b.source !== platformFilter) return false
        return true
    })

    const handleCsvImport = useCallback((_newBookings: any[], _newGuests: any[], _newTasks: any[]) => {
        // CSV import handled elsewhere
    }, [])

    const handleOpenAdd = () => {
        setEditTarget(null)
        setFormOpen(true)
    }

    const handleOpenEdit = (e: React.MouseEvent, booking: Booking) => {
        e.stopPropagation()
        setEditTarget(booking)
        setFormOpen(true)
    }

    const handleOpenDelete = (e: React.MouseEvent, booking: Booking) => {
        e.stopPropagation()
        setDeleteTarget(booking)
        setDeleteError(null)
    }

    const handleFormSubmit = async (input: any) => {
        if (editTarget) {
            await updateBooking(editTarget.id, input)
        } else {
            await addBooking(input)
        }
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        setDeleteError(null)
        try {
            // Delete not yet implemented in store
            setDeleteTarget(null)
            if (selected?.id === deleteTarget.id) setSelected(null)
        } catch (err: unknown) {
            setDeleteError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
        } finally {
            setDeleting(false)
        }
    }

    const getPayoutBadgeVariant = (status: string) => {
        if (status === 'paid') return 'success' as const
        return 'warning' as const
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">Réservations</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => setCsvOpen(true)}>
                        <Upload className="h-3.5 w-3.5" /> Import CSV
                    </Button>
                    <Button size="sm" className="gap-2 text-xs font-semibold" onClick={handleOpenAdd}>
                        <Plus className="h-3.5 w-3.5" /> Nouvelle Réservation
                    </Button>
                </div>
            </div>

            {/* Removed error banner - handled globally */}

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher un client..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <Select value={platformFilter} onValueChange={setPlatformFilter}>
                            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Plateforme" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes</SelectItem>
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
                                <TableHead>Client</TableHead>
                                <TableHead>Plateforme</TableHead>
                                <TableHead>Arrivée</TableHead>
                                <TableHead>Départ</TableHead>
                                <TableHead>Nuits</TableHead>
                                <TableHead>Net</TableHead>
                                <TableHead>Profit</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right pr-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <p className="text-sm">Chargement depuis Supabase…</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileSpreadsheet className="h-8 w-8" />
                                            <p className="text-sm font-medium">Aucune réservation. Ajoutez-en une ou importez un CSV.</p>
                                            <Button size="sm" variant="outline" className="mt-1 gap-2 text-xs" onClick={handleOpenAdd}>
                                                <Plus className="h-3.5 w-3.5" /> Nouvelle Réservation
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map(b => (
                                    <TableRow
                                        key={b.id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors group"
                                        onClick={() => setSelected(b)}
                                    >
                                        <TableCell className="font-medium">{b.guestName}</TableCell>
                                        <TableCell><Badge variant={b.source as 'booking' | 'airbnb' | 'direct'}>{b.source}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{formatShortDate(b.checkIn)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{formatShortDate(b.checkOut)}</TableCell>
                                        <TableCell>{b.nights}</TableCell>
                                        <TableCell className="font-medium">{formatMAD(b.netAmount)}</TableCell>
                                        <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">{formatMAD(b.netAmount - 200)}</TableCell>
                                        <TableCell><Badge variant={getPayoutBadgeVariant(b.paymentStatus)}>{b.paymentStatus}</Badge></TableCell>
                                        <TableCell className="text-right pr-3">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                    title="Modifier"
                                                    onClick={e => handleOpenEdit(e, b)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                    title="Supprimer"
                                                    onClick={e => handleOpenDelete(e, b)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
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
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="capitalize">{selected.source}</Badge>
                                        <Button
                                            variant="outline" size="sm" className="gap-1.5 text-xs h-7"
                                            onClick={e => handleOpenEdit(e as React.MouseEvent, selected)}
                                        >
                                            <Pencil className="h-3 w-3" /> Modifier
                                        </Button>
                                    </div>
                                </div>
                                <SheetDescription>
                                    {formatShortDate(selected.checkIn)} → {formatShortDate(selected.checkOut)} ({selected.nights} nuits)
                                </SheetDescription>
                            </SheetHeader>

                            <div className="space-y-8">
                                {/* Guest Info */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Informations client</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground text-xs">Téléphone</p>
                                            <p className="font-medium">{selected.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Email</p>
                                            <p className="font-medium truncate">{selected.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Nationalité</p>
                                            <p className="font-medium capitalize">{selected.nationality || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Voyageurs</p>
                                            <p className="font-medium">{selected.guestCount}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financials */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold">Finances</h3>
                                        <Badge variant={getPayoutBadgeVariant(selected.paymentStatus)}>
                                            {selected.paymentStatus}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-xl border">
                                        <div>
                                            <p className="text-muted-foreground text-xs">Net encaissé</p>
                                            <p className="font-semibold text-base">{formatMAD(selected.netAmount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Profit net</p>
                                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatMAD(selected.netAmount - 200)}</p>
                                        </div>
                                    </div>
                                    {selected.paymentStatus === 'pending' && (
                                        <Button variant="outline" className="w-full mt-3 gap-2 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
                                            <CheckCircle2 className="h-4 w-4" /> Marquer comme reçu
                                        </Button>
                                    )}
                                </div>

                                {/* Documents */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Documents (Conformité Maroc)</h3>
                                    <div className="border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                                            <Upload className="h-5 w-5" />
                                        </div>
                                        <p className="font-medium text-sm">Téléverser CIN / Passeport</p>
                                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Cliquez ou glissez ici pour uploader les documents requis.</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Add / Edit Modal */}
            <BookingFormModal
                open={formOpen}
                onOpenChange={setFormOpen}
                booking={editTarget}
                onSubmit={handleFormSubmit}
            />

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Supprimer la réservation
                        </DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer la réservation de{' '}
                            <span className="font-semibold text-foreground">{deleteTarget?.guestName}</span> ?
                            Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteError && (
                        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                            {deleteError}
                        </p>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting} className="gap-2">
                            {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CSV Dialog */}
            <CsvImportDialog open={csvOpen} onOpenChange={setCsvOpen} onImportComplete={handleCsvImport} existingGuests={[]} />
        </div>
    )
}
