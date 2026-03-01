import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useTheme } from '@/lib/theme'
import { Monitor, Sun, Moon, Lock, Plug } from 'lucide-react'

export default function Settings() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Appearance</CardTitle>
                    <CardDescription>Customize the look and feel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Theme</Label>
                            <p className="text-xs text-muted-foreground">Select your preferred theme</p>
                        </div>
                        <Select value={theme} onValueChange={v => setTheme(v as 'light' | 'dark' | 'system')}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="system"><div className="flex items-center gap-2"><Monitor className="h-3.5 w-3.5" /> Auto (System)</div></SelectItem>
                                <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="h-3.5 w-3.5" /> Light</div></SelectItem>
                                <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="h-3.5 w-3.5" /> Dark</div></SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Currency */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Currency</CardTitle>
                    <CardDescription>Default currency for all transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">MAD — Moroccan Dirham</p>
                                <p className="text-xs text-muted-foreground">Locked for this version</p>
                            </div>
                        </div>
                        <Badge variant="secondary">V1</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Integrations */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Plug className="h-4 w-4" /> Integrations
                    </CardTitle>
                    <CardDescription>Connect external platforms</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center py-8 text-muted-foreground">
                        <Plug className="h-8 w-8 mb-3 opacity-40" />
                        <p className="text-sm font-medium">Coming soon</p>
                        <p className="text-xs mt-1">Booking.com, Airbnb, and payment provider integrations</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
