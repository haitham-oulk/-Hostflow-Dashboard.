import { create } from 'zustand'
import { supabase } from './supabase'

/* ── Zustand Store – Connected to Supabase ── */

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AppState {
    properties: any[]
    bookings: any[]
    tasks: any[]
    reviews: any[]
    partners: any[]
    loading: boolean

    fetchAll: () => Promise<void>
    fetchProperties: () => Promise<void>
    fetchBookings: () => Promise<void>
    fetchTasks: () => Promise<void>
    fetchReviews: () => Promise<void>
    fetchPartners: () => Promise<void>

    addProperty: (d: any) => Promise<void>
    updateProperty: (id: string, d: any) => Promise<void>

    addBooking: (d: any) => Promise<void>
    updateBooking: (id: string, d: any) => Promise<void>

    addTask: (d: any) => Promise<void>
    updateTask: (id: string, d: any) => Promise<void>
    deleteTask: (id: string) => Promise<void>

    addReview: (d: any) => Promise<void>

    addPartner: (d: any) => Promise<void>
    removePartner: (id: string) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
    properties: [],
    bookings: [],
    tasks: [],
    reviews: [],
    partners: [],
    loading: true,

    /* ── Fetch All ── */
    fetchAll: async () => {
        set({ loading: true })
        await Promise.all([
            get().fetchProperties(),
            get().fetchBookings(),
            get().fetchTasks(),
            get().fetchReviews(),
            get().fetchPartners(),
        ])
        set({ loading: false })
    },

    fetchProperties: async () => {
        const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
        if (data) set({ properties: data })
    },

    fetchBookings: async () => {
        const { data } = await supabase
            .from('bookings')
            .select('*, properties(id, name, image), guest_documents(*), additional_guests(*)')
            .order('check_in', { ascending: false })
        if (data) {
            const fmt = data.map((b: any) => ({
                id: b.id,
                propertyId: b.property_id,
                propertyName: b.properties?.name || '',
                propertyImage: b.properties?.image || '',
                source: b.source,
                status: b.status,
                checkIn: b.check_in,
                checkOut: b.check_out,
                nights: b.nights,
                guestCount: b.guest_count,
                guestName: b.guest_name,
                guestEmail: b.guest_email || '',
                guestPhone: b.guest_phone || '',
                nationality: b.nationality || '',
                additionalGuests: (b.additional_guests || []).map((g: any) => ({
                    id: g.id, fullName: g.full_name, nationality: g.nationality, email: g.email, phone: g.phone,
                })),
                guestDocuments: (b.guest_documents || []).map((d: any) => ({
                    id: d.id, guestName: d.guest_name, documentType: d.document_type,
                    fileUrl: d.file_url, fileName: d.file_name, uploaded: d.uploaded,
                })),
                isCouple: b.is_couple,
                nightlyRate: Number(b.nightly_rate),
                totalAmount: Number(b.total_amount),
                platformFees: Number(b.platform_fees),
                netAmount: Number(b.net_amount),
                paymentStatus: b.payment_status,
                reservationDate: b.reservation_date,
                reviewText: b.review_text,
                specialRequests: b.special_requests,
                createdAt: b.created_at,
            }))
            set({ bookings: fmt })
        }
    },

    fetchTasks: async () => {
        const { data } = await supabase.from('tasks').select('*, properties(name)').order('due_date')
        if (data) {
            set({ tasks: data.map((t: any) => ({ ...t, propertyName: t.properties?.name || '' })) })
        }
    },

    fetchReviews: async () => {
        const { data } = await supabase.from('reviews').select('*, properties(name)').order('date', { ascending: false })
        if (data) {
            set({ reviews: data.map((r: any) => ({ ...r, propertyName: r.properties?.name || '' })) })
        }
    },

    fetchPartners: async () => {
        const { data } = await supabase.from('partners').select('*').order('invited_at', { ascending: false })
        if (data) set({ partners: data })
    },

    /* ── Properties ── */
    addProperty: async (d) => {
        await supabase.from('properties').insert({
            name: d.name, address: d.address, city: d.city, image: d.image,
            bedrooms: d.bedrooms, bathrooms: d.bathrooms, max_guests: d.maxGuests,
            base_price: d.basePrice, status: d.status || 'active',
            airbnb_url: d.airbnbUrl, booking_url: d.bookingUrl,
            airbnb_listing_id: d.airbnbListingId, booking_listing_id: d.bookingListingId,
        })
        await get().fetchProperties()
    },

    updateProperty: async (id, d) => {
        const u: any = {}
        if (d.name !== undefined) u.name = d.name
        if (d.address !== undefined) u.address = d.address
        if (d.city !== undefined) u.city = d.city
        if (d.image !== undefined) u.image = d.image
        if (d.bedrooms !== undefined) u.bedrooms = d.bedrooms
        if (d.bathrooms !== undefined) u.bathrooms = d.bathrooms
        if (d.maxGuests !== undefined) u.max_guests = d.maxGuests
        if (d.basePrice !== undefined) u.base_price = d.basePrice
        if (d.status !== undefined) u.status = d.status
        if (d.airbnbUrl !== undefined) u.airbnb_url = d.airbnbUrl
        if (d.bookingUrl !== undefined) u.booking_url = d.bookingUrl
        if (d.airbnbListingId !== undefined) u.airbnb_listing_id = d.airbnbListingId
        if (d.bookingListingId !== undefined) u.booking_listing_id = d.bookingListingId
        if (d.airbnbIcalUrl !== undefined) u.airbnb_ical_url = d.airbnbIcalUrl
        if (d.bookingIcalUrl !== undefined) u.booking_ical_url = d.bookingIcalUrl

        await supabase.from('properties').update(u).eq('id', id)
        await get().fetchProperties()
    },

    /* ── Bookings ── */
    addBooking: async (d) => {
        const { data: booking } = await supabase.from('bookings').insert({
            property_id: d.propertyId, guest_name: d.guestName, nationality: d.nationality,
            guest_count: d.guestCount, guest_email: d.guestEmail, guest_phone: d.guestPhone,
            source: d.source, nights: d.nights, check_in: d.checkIn, check_out: d.checkOut,
            total_amount: d.totalAmount, platform_fees: d.platformFees, net_amount: d.netAmount,
            nightly_rate: d.nightlyRate, payment_status: d.paymentStatus || 'pending',
            reservation_date: d.reservationDate || new Date().toISOString().split('T')[0],
            is_couple: d.isCouple, special_requests: d.specialRequests,
            status: d.status || 'confirmed',
        }).select().single()

        if (booking) {
            // Guest documents
            const docs: any[] = [{ booking_id: booking.id, guest_name: d.guestName, document_type: 'id_card', uploaded: false }]
            if (d.additionalGuests?.length) {
                for (const g of d.additionalGuests) {
                    await supabase.from('additional_guests').insert({ booking_id: booking.id, full_name: g.fullName, nationality: g.nationality })
                    docs.push({ booking_id: booking.id, guest_name: g.fullName, document_type: 'id_card', uploaded: false })
                }
            }
            if (d.isCouple) docs.push({ booking_id: booking.id, guest_name: `${d.guestName} (couple)`, document_type: 'marriage_certificate', uploaded: false })
            await supabase.from('guest_documents').insert(docs)

            // Auto tasks
            if (d.propertyId) {
                await supabase.from('tasks').insert([
                    { property_id: d.propertyId, type: 'cleaning', title: `Ménage - ${d.guestName}`, status: 'pending', due_date: d.checkOut, booking_id: booking.id },
                    { property_id: d.propertyId, type: 'key_collection', title: `Clés - ${d.guestName}`, status: 'pending', due_date: d.checkOut, booking_id: booking.id },
                ])
            }
        }
        await get().fetchAll()
    },

    updateBooking: async (id, d) => {
        const u: any = {}
        if (d.status) u.status = d.status
        if (d.paymentStatus) u.payment_status = d.paymentStatus
        if (Object.keys(u).length) await supabase.from('bookings').update(u).eq('id', id)
        if (d.guestDocuments) {
            for (const doc of d.guestDocuments) {
                if (doc.id) await supabase.from('guest_documents').update({ uploaded: doc.uploaded, file_url: doc.fileUrl, file_name: doc.fileName }).eq('id', doc.id)
            }
        }
        await get().fetchBookings()
    },

    /* ── Tasks ── */
    addTask: async (d) => {
        await supabase.from('tasks').insert({
            property_id: d.propertyId, type: d.type, title: d.title,
            description: d.description, status: d.type === 'emergency' ? 'urgent' : 'pending',
            assigned_to: d.assignedTo, due_date: d.dueDate, booking_id: d.bookingId,
        })
        await get().fetchTasks()
    },

    updateTask: async (id, d) => {
        await supabase.from('tasks').update(d).eq('id', id)
        await get().fetchTasks()
    },

    deleteTask: async (id) => {
        await supabase.from('tasks').delete().eq('id', id)
        await get().fetchTasks()
    },

    /* ── Reviews ── */
    addReview: async (d) => {
        await supabase.from('reviews').insert({
            property_id: d.propertyId, source: d.source || 'manual',
            guest_name: d.guestName, rating: d.rating, comment: d.comment,
            date: d.date || new Date().toISOString().split('T')[0],
        })
        await get().fetchReviews()
    },

    /* ── Partners ── */
    addPartner: async (d) => {
        await supabase.from('partners').insert({
            name: d.name, email: d.email, role: d.role,
            properties: d.properties, status: 'pending',
            view_bookings: d.permissions?.viewBookings,
            view_finance: d.permissions?.viewFinance,
            view_calendar: d.permissions?.viewCalendar,
            manage_tasks: d.permissions?.manageTasks,
            manage_properties: d.permissions?.manageProperties,
        })
        await get().fetchPartners()
    },

    removePartner: async (id) => {
        await supabase.from('partners').delete().eq('id', id)
        await get().fetchPartners()
    },
}))
