import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ChevronDown, Plus, BedDouble, Users, Maximize, Wifi, Car, Wind, Tv, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- MOCK DATA ---
const properties = [
    {
        id: 1,
        name: 'Villa Oasis Marrakech',
        image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=800&auto=format&fit=crop',
        status: 'Disponible',
        statusColor: 'bg-[#c2f34e]/20 text-slate-800 border-none',
        beds: '4 Chambres',
        guests: 8,
        area: 250,
        description: 'Magnifique villa luxueuse avec piscine privée et grand jardin arboré. Idéale pour les familles nombreuses ou les groupes d\'amis cherchant le confort à quelques minutes du centre-ville.',
        amenities: ['Piscine', 'Jardin', 'Wifi', 'Climatisation', 'Parking'],
        price: 2500,
    },
    {
        id: 2,
        name: 'Appartement Marina Agadir',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
        status: 'Occupé',
        statusColor: 'bg-amber-100 text-amber-800 border-none',
        beds: '2 Chambres',
        guests: 4,
        area: 85,
        description: 'Superbe vue sur l\'océan et accès direct à la plage. Cet appartement moderne vous offre tout le confort nécessaire pour un séjour balnéaire exceptionnel, au cœur de la Marina.',
        amenities: ['Vue Mer', 'Climatisation', 'Balcon', 'Wifi'],
        price: 850,
    },
    {
        id: 3,
        name: 'Riad Authentique Fès',
        image: 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?q=80&w=800&auto=format&fit=crop',
        status: 'Disponible',
        statusColor: 'bg-[#c2f34e]/20 text-slate-800 border-none',
        beds: '3 Chambres',
        guests: 6,
        area: 120,
        description: 'Plongez dans l\'histoire avec ce Riad traditionnel finement restauré. Patio intérieur verdoyant, fontaine, terrasse panoramique sur la Médina, et petit-déjeuner inclus.',
        amenities: ['Patio', 'Terrasse', 'Petit-déjeuner'],
        price: 1200,
    },
    {
        id: 4,
        name: 'Studio Moderne Casablanca',
        image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800&auto=format&fit=crop',
        status: 'Ménage',
        statusColor: 'bg-indigo-100 text-indigo-800 border-none',
        beds: '1 Lit double',
        guests: 2,
        area: 45,
        description: 'Logement parfait pour les voyageurs d\'affaires ou les couples. Situé dans le quartier central des affaires, proche du tramway et des meilleurs restaurants de la ville.',
        amenities: ['Smart TV', 'Espace Travail', 'Wifi', 'Climatisation'],
        price: 550,
    },
    {
        id: 5,
        name: 'Chalet Atlas Ifrane',
        image: 'https://images.unsplash.com/photo-1542314831-c6a4d14b83cc?q=80&w=800&auto=format&fit=crop',
        status: 'Disponible',
        statusColor: 'bg-[#c2f34e]/20 text-slate-800 border-none',
        beds: '4 Chambres',
        guests: 10,
        area: 180,
        description: 'Profitez de l\'air pur des montagnes dans ce vaste chalet. Équipé d\'une cheminée pour les soirées d\'hiver, il offre un accès facile aux pistes de ski et à la forêt.',
        amenities: ['Cheminée', 'Chauffage central', 'Cuisine équipée', 'Jardin'],
        price: 1800,
    }
]

export default function Properties() {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 max-w-6xl mx-auto">

            {/* EN-TÊTE */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-heading font-bold tracking-tight text-slate-900">Propriétés</h1>

                <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher une propriété..."
                            className="pl-9 h-[38px] bg-white border-slate-200 rounded-xl text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Button variant="outline" className="h-[38px] border-slate-200 bg-white font-medium text-slate-700 rounded-xl hidden md:flex">
                        Populaire <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>

                    <Button className="h-[38px] bg-[#c2f34e] text-slate-900 hover:bg-[#b0e03c] hover:shadow-md transition-all font-semibold rounded-xl">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Ajouter une propriété
                    </Button>
                </div>
            </div>

            {/* LISTE DES PROPRIÉTÉS */}
            <div className="space-y-5 mt-8">
                {properties.map(property => (
                    <Card key={property.id} className="flex flex-col md:flex-row p-4 border-slate-200/60 shadow-sm rounded-2xl bg-white hover:shadow-md transition-all duration-200 group">

                        {/* Image (Gauche) */}
                        <div className="w-full md:w-72 h-48 md:h-auto rounded-xl overflow-hidden shrink-0 relative">
                            <img
                                src={property.image}
                                alt={property.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Détails (Centre) */}
                        <div className="flex-1 flex flex-col justify-between py-2 md:px-6 mt-4 md:mt-0">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-[1.1rem] font-bold text-slate-900 font-heading tracking-tight">{property.name}</h3>
                                    <Badge className={cn("hidden md:flex shadow-sm font-semibold", property.statusColor)}>
                                        {property.status}
                                    </Badge>
                                </div>

                                <div className="flex items-center flex-wrap gap-4 mt-3 text-[13px] text-slate-600 font-medium">
                                    <span className="flex items-center gap-1.5"><Maximize className="w-4 h-4 text-slate-400" /> {property.area} m²</span>
                                    <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4 text-slate-400" /> {property.beds}</span>
                                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /> {property.guests} Voyageurs</span>
                                </div>

                                <p className="mt-4 text-[13.5px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {property.description}
                                </p>

                                {/* Aminities Outils */}
                                <div className="flex flex-wrap gap-2 mt-5">
                                    {property.amenities.map(amenity => (
                                        <div key={amenity} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 uppercase tracking-wide">
                                            {/* Simple icon mapping logic based on standard terms */}
                                            {amenity.toLowerCase().includes('wifi') && <Wifi className="w-3 h-3" />}
                                            {amenity.toLowerCase().includes('clim') && <Wind className="w-3 h-3" />}
                                            {amenity.toLowerCase().includes('parking') && <Car className="w-3 h-3" />}
                                            {amenity.toLowerCase().includes('tv') && <Tv className="w-3 h-3" />}
                                            {amenity.toLowerCase().includes('déjeuner') && <Coffee className="w-3 h-3" />}
                                            {amenity}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Statut & Prix (Droite) */}
                        <div className="w-full md:w-48 flex flex-col items-end justify-between py-3 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 mt-4 md:mt-0">

                            <Badge className={cn("md:hidden shadow-sm font-semibold mb-4 w-max", property.statusColor)}>
                                {property.status}
                            </Badge>

                            <div className="text-right w-full flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end">
                                <div>
                                    <span className="text-2xl font-bold font-heading text-slate-900">{property.price}</span>
                                    <span className="text-sm font-semibold text-slate-400"> MAD<span className="font-normal text-xs">/nuit</span></span>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full mt-5 font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-10">
                                Éditer la propriété
                            </Button>
                        </div>

                    </Card>
                ))}
            </div>

            <div className="flex justify-center mt-8">
                <Button variant="ghost" className="text-slate-500 hover:text-slate-900 rounded-xl font-medium">
                    Charger plus de propriétés...
                </Button>
            </div>

        </div>
    )
}
