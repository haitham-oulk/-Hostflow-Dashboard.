import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Calculator } from 'lucide-react'
import { formatMAD } from '@/lib/utils'

interface SimResult {
    guestPays: number
    platformFees: number
    hostReceives: number
    profitPerStay: number
    profitPerNight: number
}

function simulate(platform: string, nightlyPrice: number, nights: number, cleaningFee: number, genius: boolean): SimResult {
    const accommodation = nightlyPrice * nights
    let commissionRate = 0, paymentFeeRate = 0
    if (platform === 'booking') { commissionRate = 0.20; paymentFeeRate = 0.02 }
    else if (platform === 'airbnb') { commissionRate = 0.03 }

    let base = accommodation
    if (genius && platform === 'booking') base = base * 0.875 // 12.5% avg discount

    const commission = base * commissionRate
    const paymentFee = base * paymentFeeRate
    const platformFees = commission + paymentFee

    const guestPays = base + cleaningFee
    const hostReceives = base - platformFees + cleaningFee
    const profitPerStay = hostReceives
    const profitPerNight = nights > 0 ? profitPerStay / nights : 0

    return { guestPays, platformFees, hostReceives, profitPerStay, profitPerNight }
}

function PricingTab({ platform }: { platform: string }) {
    const [nightlyPrice, setNightlyPrice] = useState(1700)
    const [nights, setNights] = useState(3)
    const [cleaningFee, setCleaningFee] = useState(200)
    const [genius, setGenius] = useState(false)

    const result = useMemo(() => simulate(platform, nightlyPrice, nights, cleaningFee, genius), [platform, nightlyPrice, nights, cleaningFee, genius])
    const lowMargin = result.profitPerNight < 250

    const rules: Record<string, string> = {
        booking: '20% commission + 2% payment fee',
        airbnb: '3% host fee',
        direct: 'No platform fees',
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Inputs */}
            <div className="space-y-5">
                <div>
                    <Label>Nightly Price (MAD)</Label>
                    <Input type="number" value={nightlyPrice} onChange={e => setNightlyPrice(+e.target.value)} className="mt-1" />
                </div>
                <div>
                    <Label>Number of Nights</Label>
                    <Input type="number" value={nights} onChange={e => setNights(+e.target.value)} className="mt-1" />
                </div>
                <div>
                    <Label>Cleaning Fee (MAD)</Label>
                    <Input type="number" value={cleaningFee} onChange={e => setCleaningFee(+e.target.value)} className="mt-1" />
                </div>
                {platform === 'booking' && (
                    <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                        <div>
                            <Label className="font-medium">Genius Discount</Label>
                            <p className="text-xs text-muted-foreground">10–15% discount (avg 12.5%)</p>
                        </div>
                        <Switch checked={genius} onCheckedChange={setGenius} />
                    </div>
                )}
                <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Platform Rules</p>
                    <p className="text-sm font-medium">{rules[platform]}</p>
                </div>
            </div>

            {/* Results */}
            <Card className="h-fit">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calculator className="h-4 w-4" /> Simulation Results
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Guest pays</span><span className="font-semibold">{formatMAD(result.guestPays)} MAD</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Platform fees</span><span className="font-medium text-destructive">-{formatMAD(result.platformFees)} MAD</span></div>
                        <Separator />
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Host receives</span><span className="font-bold text-lg">{formatMAD(result.hostReceives)} MAD</span></div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Profit per stay</span><span className="font-semibold">{formatMAD(result.profitPerStay)} MAD</span></div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Profit per night</span>
                            <span className={`font-semibold ${lowMargin ? 'text-destructive' : ''}`}>{formatMAD(result.profitPerNight)} MAD</span>
                        </div>
                    </div>
                    {lowMargin && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>Warning: Profit per night is below 250 MAD threshold. Consider adjusting your pricing.</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function PricingSimulator() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Pricing Simulator</h1>
                <p className="text-sm text-muted-foreground">Compare revenue across platforms</p>
            </div>
            <Tabs defaultValue="booking">
                <TabsList>
                    <TabsTrigger value="booking">Booking.com</TabsTrigger>
                    <TabsTrigger value="airbnb">Airbnb</TabsTrigger>
                    <TabsTrigger value="direct">Direct</TabsTrigger>
                </TabsList>
                <TabsContent value="booking"><PricingTab platform="booking" /></TabsContent>
                <TabsContent value="airbnb"><PricingTab platform="airbnb" /></TabsContent>
                <TabsContent value="direct"><PricingTab platform="direct" /></TabsContent>
            </Tabs>
        </div>
    )
}
