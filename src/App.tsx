import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme'
import { BookingsProvider } from '@/lib/useBookings'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Bookings from '@/pages/Bookings'
import CalendarPage from '@/pages/Calendar'
import PricingSimulator from '@/pages/PricingSimulator'
import Finance from '@/pages/Finance'
import Housekeeping from '@/pages/Housekeeping'
import Documents from '@/pages/Documents'
import Partners from '@/pages/Partners'
import Settings from '@/pages/Settings'
import Guests from '@/pages/Guests'
import Invoices from '@/pages/Invoices'
import Messages from '@/pages/Messages'
import Properties from '@/pages/Properties'
import Reviews from '@/pages/Reviews'

export default function App() {
    return (
        <ThemeProvider>
            <BookingsProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<AppShell />}>
                            {/* Primary navigation */}
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/bookings" element={<Bookings />} />
                            <Route path="/guests" element={<Guests />} />
                            <Route path="/invoices" element={<Invoices />} />
                            <Route path="/messages" element={<Messages />} />
                            {/* Secondary navigation */}
                            <Route path="/calendar" element={<CalendarPage />} />
                            <Route path="/pricing" element={<PricingSimulator />} />
                            <Route path="/finance" element={<Finance />} />
                            <Route path="/housekeeping" element={<Housekeeping />} />
                            <Route path="/reviews" element={<Reviews />} />
                            <Route path="/partners" element={<Partners />} />
                            <Route path="/properties" element={<Properties />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </BookingsProvider>
        </ThemeProvider>
    )
}
