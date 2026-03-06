import { Key, Eye, BarChart2, FileText, Lock } from 'lucide-react'

const READ_ONLY_FEATURES = [
    { icon: BarChart2, title: 'Tableau de bord', desc: 'Vue lecture des revenus et KPIs' },
    { icon: FileText, title: 'Réservations', desc: 'Consultation de l\'historique des séjours' },
    { icon: Eye, title: 'Propriétés', desc: 'Informations sur les biens gérés' },
]

export default function Partners() {
    return (
        <div className="space-y-8 pb-8 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Accès Partenaires</h1>
                <p className="text-sm text-slate-500 mt-0.5">Gérez l'accès en lecture seule pour vos investisseurs ou co-gestionnaires.</p>
            </div>

            {/* Coming soon banner */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                }} />
                <div className="relative">
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                        <Key className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Vue Partenaire — Bientôt disponible</h2>
                    <p className="text-sm text-slate-300 max-w-sm">
                        Invitez des investisseurs ou partenaires avec un accès sécurisé en lecture seule. Ils pourront suivre les performances sans pouvoir modifier les données.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-sm font-medium cursor-not-allowed select-none">
                        <Lock className="h-4 w-4" />
                        En cours de développement
                    </div>
                </div>
            </div>

            {/* What's included */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Ce que le partenaire pourra voir</p>
                <div className="space-y-3">
                    {READ_ONLY_FEATURES.map(f => (
                        <div key={f.title} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                            <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                                <f.icon className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-slate-800">{f.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
                            </div>
                            <div className="ml-auto">
                                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium border border-emerald-100">Inclus</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Locked invite form */}
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 flex flex-col items-center text-center">
                <Lock className="h-8 w-8 text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-400">Invitation par lien — à venir</p>
                <p className="text-xs text-slate-300 max-w-xs mt-1">Vous pourrez générer un lien d'accès sécurisé pour chaque partenaire avec une date d'expiration.</p>
            </div>
        </div>
    )
}
