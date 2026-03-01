import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            {/* Main area offset by sidebar width — handles collapsed via CSS transition */}
            <div className="pl-60 transition-all duration-300" id="main-wrapper">
                <Topbar />
                <main className="mx-auto max-w-[1400px] p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
