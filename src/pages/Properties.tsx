import { Building2 } from 'lucide-react'

export default function Properties() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-heading font-bold tracking-tight text-slate-900">Propriétés</h1>
                <p className="text-sm text-slate-500 mt-1">Gérez vos annonces et unités locatives</p>
            </div>
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-200 rounded-2xl bg-white">
                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <Building2 className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Module Propriétés</h3>
                <p className="text-sm text-slate-500 mt-1">Module en construction</p>
            </div>
        </div>
    )
}
