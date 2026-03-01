import { Users, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Guests() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Profils Invités</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Gérez vos invités et leurs documents de conformité
                    </p>
                </div>
                <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20">
                    <Plus className="h-4 w-4" />
                    Nouvel Invité
                </Button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un invité..." className="pl-9" />
            </div>

            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-2xl">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-5">
                    <Users className="h-9 w-9 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold">Module Invités</h3>
                <p className="text-sm text-muted-foreground mt-1.5 text-center max-w-sm">
                    Upload des pièces d'identité, certificats de mariage, et gestion de la conformité — connecté à Supabase.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-4 font-medium uppercase tracking-wider">Phase 4 — Prochainement</p>
            </div>
        </div>
    )
}
