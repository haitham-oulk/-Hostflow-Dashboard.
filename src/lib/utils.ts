import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatMAD(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount) + ' MAD'
}

export function formatDate(date: string): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export function formatDateShort(date: string): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
    })
}

export function getSourceColor(source: string) {
    switch (source) {
        case 'airbnb': return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', gradient: 'from-rose-500 to-pink-600' }
        case 'booking': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-600' }
        case 'direct': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-600' }
        default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500', gradient: 'from-gray-500 to-gray-600' }
    }
}

export function getStatusBadge(status: string) {
    switch (status) {
        case 'confirmed': return { label: 'Confirmée', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '✓' }
        case 'pending': return { label: 'En attente', bg: 'bg-amber-50', text: 'text-amber-700', icon: '⏳' }
        case 'checked_out': return { label: 'Terminée', bg: 'bg-slate-100', text: 'text-slate-600', icon: '✔' }
        case 'cancelled': return { label: 'Annulée', bg: 'bg-red-50', text: 'text-red-700', icon: '✕' }
        case 'paid': return { label: 'Payé', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '✓' }
        case 'scheduled': return { label: 'Programmé', bg: 'bg-blue-50', text: 'text-blue-700', icon: '📅' }
        default: return { label: status, bg: 'bg-gray-50', text: 'text-gray-700', icon: '' }
    }
}

export function getNextThursday(from: Date = new Date()): Date {
    const d = new Date(from)
    d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7 || 7))
    return d
}

export function calculateNights(checkIn: string, checkOut: string): number {
    return Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
}
