import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ChevronDown, CheckSquare, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- MOCK DATA ---
const housekeepingTasks = [
    { id: 1, room: 'Room 101', type: 'Deluxe', status: 'Cleaning in Progress', priority: 'High', floor: '1st', reservation: 'Checked In', notes: 'Guest requested extra towels and pillows.' },
    { id: 2, room: 'Room 102', type: 'Standard', status: 'Ready', priority: 'Low', floor: '1st', reservation: 'Reserved', notes: 'Ensure room is stocked with amenities.' },
    { id: 3, room: 'Room 103', type: 'Suite', status: 'Needs Cleaning', priority: 'High', floor: '2nd', reservation: 'Checked Out', notes: 'Deep clean due to extended stay.' },
    { id: 4, room: 'Room 201', type: 'Standard', status: 'Cleaning in Progress', priority: 'Medium', floor: '2nd', reservation: 'Checked In', notes: 'Guest requested fresh linens.' },
    { id: 5, room: 'Room 202', type: 'Standard', status: 'Needs Cleaning', priority: 'Medium', floor: '2nd', reservation: 'Checked Out', notes: 'Ensure bathroom amenities are replenished.' },
    { id: 6, room: 'Room 203', type: 'Deluxe', status: 'Ready', priority: 'Low', floor: '2nd', reservation: 'Reserved', notes: 'Check minibar supplies and restock if necessary.' },
    { id: 7, room: 'Room 301', type: 'Suite', status: 'Needs Inspection', priority: 'Medium', floor: '3rd', reservation: 'Checked Out', notes: 'Verify that all electronics are functioning properly.' },
    { id: 8, room: 'Room 302', type: 'Deluxe', status: 'Cleaning in Progress', priority: 'High', floor: '3rd', reservation: 'Checked In', notes: 'Guest reported a spill on the carpet.' },
    { id: 9, room: 'Room 303', type: 'Suite', status: 'Ready', priority: 'Low', floor: '3rd', reservation: 'Reserved', notes: 'Ensure all towels are replaced.' },
    { id: 10, room: 'Room 304', type: 'Standard', status: 'Needs Cleaning', priority: 'Medium', floor: '3rd', reservation: 'Checked Out', notes: 'Check for any maintenance issues.' },
    { id: 11, room: 'Room 305', type: 'Deluxe', status: 'Cleaning in Progress', priority: 'Low', floor: '3rd', reservation: 'Checked In', notes: 'Verify that the mini-fridge is filled with refreshments.' },
    { id: 12, room: 'Room 401', type: 'Suite', status: 'Ready', priority: 'Low', floor: '4th', reservation: 'Reserved', notes: 'Make sure the coffee & tea station is fully equipped.' },
    { id: 13, room: 'Room 402', type: 'Standard', status: 'Needs Cleaning', priority: 'Medium', floor: '4th', reservation: 'Checked Out', notes: 'Replenish the room\'s amenities.' },
]

export default function Housekeeping() {
    const [searchQuery, setSearchQuery] = useState('')

    // Helper functions for stylish badges
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Ready':
                return <Badge className="bg-[#c2f34e]/20 text-slate-800 border-none font-semibold hover:bg-[#c2f34e]/30 px-3 py-1"><CheckSquare className="w-3.5 h-3.5 mr-1 text-[#c2f34e]" /> Ready</Badge>
            case 'Cleaning in Progress':
                return <Badge className="bg-sky-100 text-sky-800 border-none font-semibold hover:bg-sky-200 px-3 py-1"><RefreshCw className="w-3.5 h-3.5 mr-1" /> In Progress</Badge>
            case 'Needs Cleaning':
                return <Badge className="bg-rose-100 text-rose-800 border-none font-semibold hover:bg-rose-200 px-3 py-1"><Sparkles className="w-3.5 h-3.5 mr-1" /> Needs Cleaning</Badge>
            case 'Needs Inspection':
                return <Badge className="bg-amber-100 text-amber-800 border-none font-semibold hover:bg-amber-200 px-3 py-1"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Inspection</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'High':
                return <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> High</span>
            case 'Medium':
                return <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Medium</span>
            case 'Low':
                return <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Low</span>
            default:
                return <span>{priority}</span>
        }
    }

    const getReservationBadge = (res: string) => {
        return <span className="text-[13px] font-medium text-slate-600">{res}</span>
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">

            {/* EN-TÊTE */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-heading font-bold tracking-tight text-slate-900">Housekeeping</h1>

                <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search room, floor, etc"
                            className="pl-9 h-[38px] bg-white border-slate-200 rounded-xl text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Button variant="outline" className="h-[38px] border-slate-200 bg-[#c2f34e]/10 text-slate-800 hover:bg-[#c2f34e]/20 border-[#c2f34e]/30 rounded-xl hidden md:flex font-semibold">
                        All Room <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>

                    <Button variant="outline" className="h-[38px] border-slate-200 bg-[#c2f34e]/10 text-slate-800 hover:bg-[#c2f34e]/20 border-[#c2f34e]/30 rounded-xl hidden lg:flex font-semibold">
                        All Status <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>

                    <Button variant="outline" className="h-[38px] border-slate-200 bg-[#c2f34e]/10 text-slate-800 hover:bg-[#c2f34e]/20 border-[#c2f34e]/30 rounded-xl hidden xl:flex font-semibold">
                        All Priority <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </div>
            </div>

            {/* TABLEAU OPÉRATIONNEL */}
            <Card className="border-slate-200/60 shadow-sm rounded-2xl bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-12">
                                    <input type="checkbox" className="rounded-sm border-slate-300 text-[#c2f34e] focus:ring-[#c2f34e] w-4 h-4 cursor-pointer" />
                                </th>
                                <th className="px-6 py-4 font-semibold">Room Number</th>
                                <th className="px-6 py-4 font-semibold">Room Type</th>
                                <th className="px-6 py-4 font-semibold text-center">Housekeeping Status</th>
                                <th className="px-6 py-4 font-semibold">Priority</th>
                                <th className="px-6 py-4 font-semibold">Floor</th>
                                <th className="px-6 py-4 font-semibold">Reservation Status</th>
                                <th className="px-6 py-4 font-semibold">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {housekeepingTasks.map((task) => (
                                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="rounded-sm border-slate-300 text-[#c2f34e] focus:ring-[#c2f34e] w-4 h-4 cursor-pointer" />
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-900">{task.room}</td>
                                    <td className="px-6 py-4 text-slate-500">{task.type}</td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(task.status)}
                                    </td>
                                    <td className="px-6 py-4">{getPriorityBadge(task.priority)}</td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">{task.floor}</td>
                                    <td className="px-6 py-4">{getReservationBadge(task.reservation)}</td>
                                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={task.notes}>{task.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Facade */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <span>Showing 1-13 of 535</span>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" disabled><ChevronDown className="h-4 w-4 rotate-90" /></Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 rounded-md bg-[#c2f34e] text-slate-900 border-[#c2f34e] font-bold">1</Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-md hover:bg-slate-100 font-medium">2</Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-md hover:bg-slate-100 font-medium">3</Button>
                        <span className="px-2">...</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-md hover:bg-slate-100 font-medium">8</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><ChevronDown className="h-4 w-4 -rotate-90" /></Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
