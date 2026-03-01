import { Receipt, Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Invoices() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Invoices / Expenses</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Factures, dépenses et audit des paiements
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Importer PDF
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20">
                        <Plus className="h-4 w-4" />
                        Nouvelle Dépense
                    </Button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-2xl">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-5">
                    <Receipt className="h-9 w-9 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold">Intelligence Financière</h3>
                <p className="text-sm text-muted-foreground mt-1.5 text-center max-w-sm">
                    Convertisseur EUR/MAD, AI Payout Auditor, et détection des frais bancaires cachés — connecté à Supabase.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-4 font-medium uppercase tracking-wider">Phase 4 — Prochainement</p>
            </div>
        </div>
    )
}
