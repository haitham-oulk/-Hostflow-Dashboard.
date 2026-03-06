import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard, CalendarDays, Users, Calculator,
    DollarSign, Building2, Key, Home, BookOpen, BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'

/* ── 5 core pages only ── */
const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Tableau de Bord' },
    { to: '/bookings', icon: BookOpen, label: 'Réservations' },
    { to: '/guests', icon: Users, label: 'Clients' },
    { to: '/pricing', icon: Calculator, label: 'Simulateur Prix' },
    { to: '/finance', icon: DollarSign, label: 'Finance' },
    { to: '/analytics', icon: BarChart3, label: 'Analytiques' },
    { to: '/calendar', icon: CalendarDays, label: 'Calendrier' },
    { to: '/properties', icon: Building2, label: 'Propriétés' },
    { to: '/partners', icon: Key, label: 'Accès Partenaires' },
]

function NavItem({ item, collapsed }: { item: typeof navItems[0]; collapsed: boolean }) {
    return (
        <NavLink
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => cn(
                "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                    ? "bg-rose-50/50 text-rose-500"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                collapsed && "justify-center px-2"
            )}
        >
            {({ isActive }) => (
                <>
                    <div className="flex items-center gap-3">
                        <item.icon className={cn(
                            "h-[18px] w-[18px] shrink-0 transition-colors",
                            isActive ? "text-rose-500" : "text-slate-400 group-hover:text-slate-600"
                        )} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!collapsed && isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    )}
                </>
            )}
        </NavLink>
    )
}

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200/60 transition-all duration-300 bg-white",
            collapsed ? "w-[68px]" : "w-64"
        )}>
            {/* Logo */}
            <div className="flex h-[72px] items-center gap-3 px-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-sm shadow-orange-500/20">
                    <Home className="h-4 w-4" />
                </div>
                {!collapsed && (
                    <span className="text-xl font-heading font-bold text-slate-900 tracking-tight">
                        HostFlow
                    </span>
                )}
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <nav className="flex flex-col gap-1 px-3">
                    {navItems.map((item) => (
                        <NavItem key={item.to} item={item} collapsed={collapsed} />
                    ))}
                </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-slate-600">HA</span>
                    </div>
                    {!collapsed && <span className="text-sm font-medium">Réglages</span>}
                </Button>
            </div>
        </aside>
    )
}
