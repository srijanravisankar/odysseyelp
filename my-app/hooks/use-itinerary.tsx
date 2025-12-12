'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useChat } from '@/hooks/context/session-context'
import { useUser } from '@/hooks/context/user-context'

export interface Itinerary {
  id: number
  created_at: string
  user_id: string
  title: string
  prompt: string
  stops: any
  session_id: number
}

export function useItineraries() {
  const supabase = createClient()
  const { active } = useChat()
  const { user } = useUser()
  
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItineraries = async () => {
      // Don't fetch if we don't have required data
      if (!active || !user?.email) {
        setItineraries([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Get the authenticated user ID
        const { data: authData } = await supabase.auth.getUser()
        if (!authData.user) {
          setError('User not authenticated')
          return
        }

        // Fetch itineraries for this user and session
        const { data, error: queryError } = await supabase
          .from('itineraries')
          .select('*')
          .eq('user_id', authData.user.id)
          .eq('session_id', active)
          .order('created_at', { ascending: false })

        if (queryError) {
          setError(queryError.message)
          console.error('Error fetching itineraries:', queryError)
          return
        }

        setItineraries(data || [])
      } catch (err: any) {
        setError(err.message || 'Failed to fetch itineraries')
        console.error('Fetch itineraries error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchItineraries()
  }, [active, user?.email, supabase])

  return {
    itineraries,
    loadingItinerary: loading,
    error,
  }
}