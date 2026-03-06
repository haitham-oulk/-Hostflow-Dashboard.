import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { ThemeProvider } from '@/lib/theme'
import { useStore } from '@/lib/store'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Bookings from '@/pages/Bookings'
import CalendarPage from '@/pages/Calendar'
import PricingSimulator from '@/pages/PricingSimulator'
import Finance from '@/pages/Finance'
import Partners from '@/pages/Partners'
import Guests from '@/pages/Guests'
import Properties from '@/pages/Properties'
import Settings from '@/pages/Settings'
import Analytics from '@/pages/Analytics'
import NewBooking from '@/pages/NewBooking'

function AppContent() {
    const { fetchAll } = useStore()

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/bookings/new" element={<NewBooking />} />
                <Route path="/guests" element={<Guests />} />
                <Route path="/pricing" element={<PricingSimulator />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
            </Route>
        </Routes>
    )
}

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </ThemeProvider>
    )
}
