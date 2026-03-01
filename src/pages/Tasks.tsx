import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Plus, Sparkles, Key, Wrench, GripVertical } from 'lucide-react'
import type { Task, TaskStatus } from '@/mock/types'
import { cn } from '@/lib/utils'

const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'To Do', color: 'bg-red-500' },
    { id: 'done', title: 'Done', color: 'bg-emerald-500' },
]

const typeIcons: Record<string, typeof Sparkles> = {
    cleaning: Sparkles,
    key: Key,
    urgent: Wrench,
}

const typeColors: Record<string, string> = {
    cleaning: 'text-blue-500',
    key: 'text-amber-500',
    urgent: 'text-red-500',
}

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [showAdd, setShowAdd] = useState(false)
    const [newTitle, setNewTitle] = useState('')

    const moveTask = (taskId: string, newStatus: TaskStatus) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    }

    const addTask = () => {
        if (!newTitle.trim()) return
        const task: Task = {
            id: `T-${Date.now()}`,
            type: 'urgent',
            title: newTitle,
            dueAt: new Date().toISOString(),
            status: 'todo',
        }
        setTasks(prev => [...prev, task])
        setNewTitle('')
        setShowAdd(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
            </div>

            {/* Kanban */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {columns.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.id)
                    return (
                        <div key={col.id} className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <div className={cn("h-2.5 w-2.5 rounded-full", col.color)} />
                                <h3 className="text-sm font-semibold">{col.title}</h3>
                                <Badge variant="secondary" className="text-xs ml-auto">{colTasks.length}</Badge>
                            </div>
                            <div className="space-y-2 min-h-[200px]">
                                {colTasks.map(t => {
                                    const Icon = typeIcons[t.type] || Wrench
                                    return (
                                        <Card key={t.id} className="cursor-grab active:cursor-grabbing">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className={cn("mt-0.5 shrink-0", typeColors[t.type])}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium leading-tight">{t.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {new Date(t.dueAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <Badge variant="outline" className="text-[10px] capitalize">{t.type}</Badge>
                                                            {t.bookingId && <Badge variant="secondary" className="text-[10px]">{t.bookingId}</Badge>}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Quick move buttons */}
                                                <div className="flex gap-1 mt-3">
                                                    {columns.filter(c => c.id !== col.id).map(c => (
                                                        <Button key={c.id} variant="ghost" size="sm" className="text-xs h-7 flex-1"
                                                            onClick={() => moveTask(t.id, c.id)}>
                                                            → {c.title}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Floating Add Button */}
            <Button size="lg" className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50" onClick={() => setShowAdd(true)}>
                <Plus className="h-5 w-5" />
            </Button>

            {/* Add Task Dialog */}
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Urgent Task</DialogTitle>
                        <DialogDescription>Create a new task that will be added to the "To Do" column</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div><Label>Task Title</Label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Fix AC unit in bedroom" className="mt-1" /></div>
                        <Button className="w-full" onClick={addTask}>Add Task</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
