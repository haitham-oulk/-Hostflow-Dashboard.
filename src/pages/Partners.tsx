import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, UserPlus, Shield, XCircle } from 'lucide-react'
import type { Partner } from '@/mock/types'
import { formatDate } from '@/lib/utils'

const permissionLabels = {
    viewBookings: 'View bookings',
    editBookings: 'Edit bookings',
    viewFinance: 'View finance',
    viewDocuments: 'View documents',
    manageTasks: 'Manage tasks',
}

export default function Partners() {
    const [partners, setPartners] = useState<Partner[]>([])
    const [showAdd, setShowAdd] = useState(false)
    const [newEmail, setNewEmail] = useState('')
    const [newPerms, setNewPerms] = useState({ viewBookings: true, editBookings: false, viewFinance: false, viewDocuments: false, manageTasks: false })

    const addPartner = () => {
        if (!newEmail.trim()) return
        const p: Partner = {
            id: `P-${Date.now()}`, email: newEmail, status: 'active',
            lastLogin: 'Never', permissions: { ...newPerms },
        }
        setPartners(prev => [...prev, p])
        setNewEmail('')
        setShowAdd(false)
    }

    const toggleStatus = (id: string) => {
        setPartners(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'revoked' : 'active' } : p))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Partner Access</h1>
                    <p className="text-sm text-muted-foreground">Manage partner permissions</p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => setShowAdd(true)}>
                    <UserPlus className="h-3.5 w-3.5" /> Add Partner
                </Button>
            </div>

            {/* Partners List */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partners.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.email}</TableCell>
                                    <TableCell><Badge variant={p.status === 'active' ? 'success' : 'destructive'}>{p.status}</Badge></TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(p.permissions).filter(([, v]) => v).map(([k]) => (
                                                <Badge key={k} variant="secondary" className="text-[10px]">{permissionLabels[k as keyof typeof permissionLabels]}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{p.lastLogin === 'Never' ? 'Never' : formatDate(p.lastLogin)}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => toggleStatus(p.id)}>
                                            {p.status === 'active' ? (
                                                <><XCircle className="h-3 w-3 mr-1" /> Revoke</>
                                            ) : (
                                                <><Shield className="h-3 w-3 mr-1" /> Restore</>
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Partner Dialog */}
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Partner</DialogTitle>
                        <DialogDescription>Invite a partner with specific access permissions</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div><Label>Email</Label><Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="partner@example.com" className="mt-1" /></div>
                        <Separator />
                        <p className="text-sm font-medium">Permissions</p>
                        <div className="space-y-3">
                            {(Object.keys(permissionLabels) as (keyof typeof permissionLabels)[]).map(key => (
                                <div key={key} className="flex items-center justify-between">
                                    <Label className="text-sm">{permissionLabels[key]}</Label>
                                    <Switch checked={newPerms[key]} onCheckedChange={v => setNewPerms(p => ({ ...p, [key]: v }))} />
                                </div>
                            ))}
                        </div>
                        <Button className="w-full" onClick={addPartner}>Send Invitation</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
