import { MessageSquare } from 'lucide-react'

export default function Messages() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Messagerie Unifiée</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    WhatsApp, Airbnb, Email — tout au même endroit
                </p>
            </div>

            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-2xl">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center mb-5">
                    <MessageSquare className="h-9 w-9 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold">Interface à 3 panneaux</h3>
                <p className="text-sm text-muted-foreground mt-1.5 text-center max-w-sm">
                    Profil de l'invité, historique des messages, et brouillons générés par l'IA — le tout unifié via Zapier MCP.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-4 font-medium uppercase tracking-wider">Phase 4 — Prochainement</p>
            </div>
        </div>
    )
}
