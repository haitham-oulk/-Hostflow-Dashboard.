import { useState } from 'react'
import {
    Search, Paperclip, Send, MoreVertical, Phone, Video,
    Star, StarOff, Clock, CalendarHeart, MapPin, BadgeCheck, FileText, Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// --- Mock Data ---

const contacts = [
    { id: 1, name: 'Sarah Afouf', avatar: 'SA', time: '09:45 AM', preview: 'Can I request a late check out for Room 305?', active: true, unread: true, platform: 'airbnb' },
    { id: 2, name: 'Mouad Raibati', avatar: 'MR', time: '09:30 AM', preview: 'The air conditioning in my room isn\'t working...', active: false, unread: false, platform: 'booking' },
    { id: 3, name: 'Hajar Mesnani', avatar: 'HM', time: 'Yesterday', preview: 'Can you confirm my airport pickup for tomorrow?', active: false, unread: false, platform: 'direct' },
    { id: 4, name: 'John Doe', avatar: 'JD', time: 'Yesterday', preview: 'I need extra towels and pillows in Room 201.', active: false, unread: false, platform: 'airbnb' },
    { id: 5, name: 'Jane Smith', avatar: 'JS', time: 'Monday', preview: 'Is breakfast included in my reservation?', active: false, unread: false, platform: 'booking' },
]

const chatHistory = [
    { id: 1, sender: 'guest', text: 'Can I request a late check out for Room 305?', time: '09:45 AM', date: 'Today, June 19' },
    { id: 2, sender: 'host', text: 'Hi Sarah, we can accommodate a late check-out for you. How late would you like to stay?', time: '09:50 AM' },
    { id: 3, sender: 'guest', text: 'I was hoping to stay until 2 PM. Is that possible?', time: '09:52 AM' },
    { id: 4, sender: 'host', text: 'Let me check the availability for Room 305. One moment, please.', time: '09:55 AM' },
    { id: 5, sender: 'host', text: 'Good news, Sarah! We can extend your check-out time to 2 PM.', time: '09:58 AM' },
    { id: 6, sender: 'guest', text: 'Thank you so much! That really helps.', time: '10:00 AM' },
    { id: 7, sender: 'host', text: "You're welcome! If you need anything else, feel free to let us know.", time: '10:05 AM' },
]

export default function Messages() {
    const [messageInput, setMessageInput] = useState('')

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6 animate-in fade-in duration-500">

            {/* ── LEFT COLUMN: INBOX ── */}
            <div className="w-[320px] shrink-0 flex flex-col bg-white rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h2 className="text-xl font-heading font-bold text-slate-900 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search name, chat, etc."
                            className="pl-9 bg-slate-50/50 border-slate-200 text-sm h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-slate-300"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col">
                        {contacts.map((contact, idx) => (
                            <button
                                key={contact.id}
                                className={cn(
                                    "px-5 py-4 flex items-start gap-3 transition-colors border-l-2",
                                    contact.active
                                        ? "bg-slate-50 border-slate-800"
                                        : "border-transparent hover:bg-slate-50/50",
                                    idx !== contacts.length - 1 && "border-b border-slate-100/60"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${contact.avatar}&backgroundColor=f1f5f9`} alt={contact.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white flex items-center justify-center",
                                        contact.platform === 'airbnb' ? 'bg-[#ff5a5f]' : contact.platform === 'booking' ? 'bg-[#003580]' : 'bg-emerald-500'
                                    )}>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <p className={cn("text-sm font-semibold truncate", contact.unread ? "text-slate-900" : "text-slate-700")}>
                                            {contact.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                                            {contact.time}
                                        </p>
                                    </div>
                                    <p className={cn(
                                        "text-[12px] truncate pr-4",
                                        contact.unread ? "text-slate-800 font-medium" : "text-slate-500"
                                    )}>
                                        {contact.preview}
                                    </p>
                                </div>
                                {contact.unread && (
                                    <div className="shrink-0 h-2 w-2 rounded-full bg-rose-500 self-center mt-2.5" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CENTER COLUMN: CHAT ── */}
            <div className="flex-1 flex flex-col bg-white rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden relative">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=SA&backgroundColor=f1f5f9`} alt="Sarah Afouf" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 leading-tight">Sarah Afouf</h2>
                            <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                Last seen recently
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 rounded-full">
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 rounded-full">
                            <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/30">
                    <div className="flex justify-center">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">Today, June 19</span>
                    </div>

                    {chatHistory.map((msg, idx) => {
                        const isHost = msg.sender === 'host'
                        return (
                            <div key={msg.id} className={cn("flex w-full gap-3", isHost ? "justify-end" : "justify-start")}>
                                {!isHost && (
                                    <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0 overflow-hidden mt-auto">
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=SA&backgroundColor=f1f5f9`} alt="Guest" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className={cn(
                                    "max-w-[70%] flex flex-col",
                                    isHost ? "items-end" : "items-start"
                                )}>
                                    <div className={cn(
                                        "px-4 py-2.5 rounded-[18px] text-[13px] leading-relaxed shadow-sm",
                                        isHost
                                            ? "bg-[#c2f34e] text-slate-900 rounded-br-sm" // Hostflow Primary Color (approximate from screenshot: yellow/green tint)
                                            : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"
                                    )}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1.5 font-medium px-1">
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-600 rounded-full shrink-0">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <Input
                            placeholder="Write a message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            className="flex-1 bg-slate-50/80 border-slate-200 h-11 rounded-full px-5 text-[14px] focus-visible:ring-1 focus-visible:ring-slate-300"
                        />
                        <Button
                            className="h-11 w-11 rounded-full shrink-0 bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-transform active:scale-95"
                            onClick={() => {
                                if (messageInput.trim()) {
                                    // In a real app, this would append to the chat history array
                                    setMessageInput('')
                                }
                            }}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── RIGHT COLUMN: PROFILE DETAILS ── */}
            <div className="w-[320px] shrink-0 flex flex-col space-y-6 overflow-y-auto pr-1 custom-scrollbar">

                {/* Profile Card */}
                <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6 flex flex-col items-center text-center relative">
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 text-slate-400 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    <div className="h-24 w-24 rounded-full bg-slate-100 mb-4 p-1 border-2 border-white shadow-sm">
                        <div className="w-full h-full rounded-full overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=SA&backgroundColor=f1f5f9`} alt="Sarah Afouf" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <h2 className="text-xl font-heading font-bold text-slate-900 mb-1">Sarah Afouf</h2>
                    <p className="text-sm text-slate-500 mb-4 flex items-center justify-center gap-1.5">
                        <Phone className="h-3 w-3" /> +212 600-123456
                    </p>
                    <div className="flex gap-2 w-full">
                        <Button variant="outline" className="flex-1 h-9 rounded-xl border-slate-200 text-slate-600 font-medium text-xs">
                            Voir Profil
                        </Button>
                        <Button variant="secondary" className="flex-1 h-9 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 font-medium text-xs">
                            <Star className="h-3.5 w-3.5 mr-1.5 text-amber-500 fill-amber-500" />
                            Favoris
                        </Button>
                    </div>
                </div>

                {/* Booking Info Card */}
                <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-emerald-500" />
                            Booking Info
                        </h3>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Confirmed
                        </Badge>
                    </div>
                    <div className="p-5 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Check-in</p>
                                <p className="text-sm font-medium text-slate-900">June 19, 2028</p>
                                <p className="text-xs text-slate-500 mt-0.5">3:00 PM</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Check-out</p>
                                <p className="text-sm font-medium text-slate-900">June 22, 2028</p>
                                <p className="text-xs text-slate-500 mt-0.5">2:00 PM</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100/60">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Room / Property</p>
                                    <p className="text-sm font-semibold text-slate-800">Deluxe Suite 305</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50/80 p-3 rounded-xl">
                                <span className="text-xs font-medium text-slate-600">Guests</span>
                                <span className="text-sm font-semibold text-slate-900">2 Adults</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100/60">
                            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-3">Price Summary</p>
                            <div className="space-y-2 mb-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Room (3 nights)</span>
                                    <span className="text-slate-700 font-medium">450.00 MAD</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">City Tax</span>
                                    <span className="text-slate-700 font-medium">36.00 MAD</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Cleaning Fee</span>
                                    <span className="text-slate-700 font-medium">50.00 MAD</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                <span className="text-sm font-semibold text-slate-900">Total Price</span>
                                <span className="text-base font-heading font-bold text-slate-900">536.00 MAD</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documents / Invoices */}
                <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                            Documents
                        </h3>
                        <span className="text-xs text-blue-500 font-medium cursor-pointer hover:underline">Show All</span>
                    </div>
                    <div className="p-3">
                        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-800">Invoice-240528.pdf</p>
                                    <p className="text-[10px] text-slate-500">1.45 mb</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Download className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
