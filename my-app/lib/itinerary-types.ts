// lib/itinerary-types.ts

export type ItineraryStop = {
    id: string
    name: string
    address: string
    url: string | null
    rating: number | null
    reviewCount: number | null
    price: string | null
    openStatus: string | null
    phone: string | null
    coordinates: {
        lat: number
        lng: number
    }
    category: string | null
}

export type ItineraryPlan = {
    title: string
    summary: string
    date: string | null
    center: {
        lat: number
        lng: number
    }
    stops: ItineraryStop[]
}
