// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import type { ItineraryPlan } from "@/lib/itinerary-types"
import type { SurveyContext } from "@/components/chat-survey-header"

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const query = body?.query as string | undefined
        const survey = body?.survey as SurveyContext | undefined

        if (!query) {
            return NextResponse.json(
                { error: "Missing query" },
                { status: 400 },
            )
        }

        // 1) Compose Yelp-specific prompt from query (+ optional survey) via Gemini
        const composedRes = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: buildGeminiPrompt({ query, survey }),
                        },
                    ],
                },
            ],
        })

        const composedPrompt = (composedRes.text ?? "").trim()
        if (!composedPrompt) {
            return NextResponse.json(
                { error: "Gemini returned empty composed prompt" },
                { status: 500 },
            )
        }

        // 2) Call Yelp AI API with composed prompt
        const yelpRes = await fetch("https://api.yelp.com/ai/chat/v2", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.YELP_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: composedPrompt,
                user_context: {
                    locale: "en_CA",
                    // TODO: later derive from survey.location if available
                    latitude: 43.6532,
                    longitude: -79.3832,
                },
            }),
        })

        if (!yelpRes.ok) {
            const text = await yelpRes.text()
            console.error("Yelp error", text)
            return NextResponse.json(
                { error: "Yelp AI API error", details: text },
                { status: 500 },
            )
        }

        const yelpData: unknown = await yelpRes.json()

        // 3) Ask Gemini to turn Yelp JSON into a clean ItineraryPlan
        const itineraryPrompt = buildItineraryPrompt({
            query,
            survey,
            composedPrompt,
            yelpData,
        })

        const itineraryRes = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: itineraryPrompt }],
                },
            ],
        })

        const rawItineraryText = (itineraryRes.text ?? "").trim()

        let itinerary: ItineraryPlan | null = null
        try {
            const jsonString = extractJsonObject(rawItineraryText)
            itinerary = JSON.parse(jsonString) as ItineraryPlan
        } catch (e) {
            console.error(
                "Failed to parse itinerary JSON from Gemini",
                e,
                rawItineraryText,
            )
        }

        // 4) Return everything to the frontend
        return NextResponse.json({
            composedPrompt,
            yelp: yelpData,
            itinerary,
        })
    } catch (err) {
        console.error(err)
        return NextResponse.json(
            { error: "Server error", details: String(err) },
            { status: 500 },
        )
    }
}

// ---------------------------------------------------------------------------
// Helper: strip ``` fences / extra text and extract the JSON object
// ---------------------------------------------------------------------------
function extractJsonObject(text: string): string {
    let cleaned = text.trim()

    // Remove leading ``` / ```json fences
    if (cleaned.startsWith("```")) {
        const firstNewline = cleaned.indexOf("\n")
        if (firstNewline !== -1) {
            cleaned = cleaned.slice(firstNewline + 1)
        }
        const lastFence = cleaned.lastIndexOf("```")
        if (lastFence !== -1) {
            cleaned = cleaned.slice(0, lastFence)
        }
        cleaned = cleaned.trim()
    }

    // As extra safety, slice between first '{' and last '}'
    const firstBrace = cleaned.indexOf("{")
    const lastBrace = cleaned.lastIndexOf("}")
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1)
    }

    return cleaned
}

// ---------------------------------------------------------------------------
// Helper 1: query + optional survey → Yelp-friendly prompt
// ---------------------------------------------------------------------------
function buildGeminiPrompt({
                               query,
                               survey,
                           }: {
    query: string
    survey?: SurveyContext
}) {
    if (survey) {
        return `
You are a prompt engineer helping to talk to the Yelp AI API.

The user filled this trip survey (JSON):
${JSON.stringify(survey, null, 2)}

The user then typed this message:
"${query}"

Using the survey and message, craft a single, clear query string that will be sent
to the Yelp AI API (https://api.yelp.com/ai/chat/v2).

Make sure your query:
- Specifies location (city/area) from the survey if present
- Includes dietary restrictions and preferences
- Includes vibe, budget, and time of day if present
- Uses natural language like a human user.

IMPORTANT:
- Reply with ONLY the final query string and nothing else.
- Do not add explanations, markdown, or JSON.
`
    }

    // No survey: just rely on the free-text query
    return `
You are a prompt engineer helping to talk to the Yelp AI API.

The user did NOT provide any structured survey, only this free-text message:
"${query}"

Rewrite this message as a single, clear query string that will be sent directly
to the Yelp AI API (https://api.yelp.com/ai/chat/v2).

IMPORTANT:
- Reply with ONLY the final query string and nothing else.
- Do not add explanations, markdown, or JSON.
`
}

// ---------------------------------------------------------------------------
// Helper 2: query + (optional) survey + Yelp JSON → ItineraryPlan JSON
// ---------------------------------------------------------------------------
// function buildItineraryPrompt({
//                                   query,
//                                   survey,
//                                   composedPrompt,
//                                   yelpData,
//                               }: {
//     query: string
//     survey?: SurveyContext
//     composedPrompt: string
//     yelpData: unknown
// }) {
//     return `
// You are helping generate a structured itinerary object for a UI.

// The user originally typed this message:
// "${query}"

// You already rewrote it for Yelp as:
// "${composedPrompt}"

// The structured survey (JSON) is:
// ${JSON.stringify(survey ?? null, null, 2)}

// The Yelp AI API responded with this JSON:
// ${JSON.stringify(yelpData, null, 2)}

// From this data, build a single itinerary JSON object with the EXACT shape:

// type ItineraryStop = {
//   id: string
//   name: string
//   address: string
//   url: string | null
//   rating: number | null
//   reviewCount: number | null
//   price: string | null
//   openStatus: string | null
//   phone: string | null
//   coordinates: { lat: number; lng: number }
//   category: string | null
//   schedule: {
//     start: string; // Format: "HH:MM AM/PM" (e.g. "10:00 AM")
//     end: string;   // Format: "HH:MM AM/PM" (e.g. "11:30 AM")
//     durationMinutes: number; 
//   }
// }

// type ItineraryPlan = {
//   title: string
//   summary: string
//   date: string | null
//   center: { lat: number; lng: number }
//   stops: ItineraryStop[]
// }

// Rules:
// - Use the Yelp business data to fill the stops, especially coordinates, rating,
//   review_count, price, and phone.
// - id should be unique strings (e.g., "stop-1", "stop-2", etc) for each stop in an ItineraryPlan.
// - address should be the human-readable formatted address if available.
// - openStatus can be a short human readable string like
//   "Open now · Closes at 10:00 PM" or null if unknown.
// - center.lat and center.lng should roughly be the average of all stop coordinates,
//   so the map can center nicely.
// - title and summary should be short and based on the survey + query
//   (e.g., "Romantic Central Park West date night").
// - date should come from survey.location.dateRange.start if present, otherwise null.

// IMPORTANT:
// - Respond with ONLY a valid JSON object matching ItineraryPlan.
// - Do NOT wrap it in backticks.
// - Do NOT add any extra commentary, markdown, or text before or after the JSON.
// `
// }

function buildItineraryPrompt({
  query,
  survey,
  composedPrompt,
  yelpData,
}: {
  query: string
  survey?: any // formatted to your SurveyContext type
  composedPrompt: string
  yelpData: unknown
}) {
  return `
You are helping generate a structured itinerary object for a UI.

The user originally typed this message:
"${query}"

You already rewrote it for Yelp as:
"${composedPrompt}"

The structured survey (JSON) is:
${JSON.stringify(survey ?? null, null, 2)}

The Yelp AI API responded with this JSON:
${JSON.stringify(yelpData, null, 2)}

From this data, build a single itinerary JSON object with the EXACT shape:

type ItineraryStop = {
  id: string
  name: string
  address: string
  url: string | null
  rating: number | null
  reviewCount: number | null
  price: string | null
  openStatus: string | null
  phone: string | null
  coordinates: { lat: number; lng: number }
  category: string | null
  schedule: {
    date: string; // Format: "YYYY-MM-DD" (e.g. "2025-12-15")
    start: string; // Format: "HH:MM AM/PM" (e.g. "10:00 AM")
    end: string;   // Format: "HH:MM AM/PM" (e.g. "11:30 AM")
    durationMinutes: number; 
  }
}

type ItineraryPlan = {
  title: string
  summary: string
  date: string | null
  center: { lat: number; lng: number }
  stops: ItineraryStop[]
}

Rules:
1. **Use Yelp Data:** Fill metadata (rating, coordinates, etc.) exactly from the Yelp response.
2. **IDs:** Use unique strings "stop-1", "stop-2", etc.
3. **Map Center:** center.lat/lng must be the average of all stops.
4. **Contextual Info:** title/summary must reflect the user's specific intent (e.g., "Quiet Anniversary Dinner").

**CRITICAL SCHEDULING RULES:**
- **Trip Date:** Determine the start date from the survey's dateRange or assume today's date. Format as YYYY-MM-DD.
- **Time Boundaries:** Check the 'query' and 'survey' for start/end times (e.g., "morning coffee" implies 8-10 AM, "late night" implies 10 PM+). If unspecified, assume a standard day (10:00 AM to 10:00 PM).
- **Sequence:** Stops must be ordered chronologically by date, then by time within each date.
- **No Overlaps:** The 'schedule.start' of a stop must be AFTER the 'schedule.end' of the previous stop (or after travel buffer on next day).
- **Realistic Durations:** Assign logical durations based on category:
  - Coffee/Bakery: 30-45 mins
  - Lunch/Dinner: 60-90 mins
  - Museum/Activity: 90-120 mins
  - Park/Walk: 45-60 mins
- **Travel Buffers:** Leave a 15-30 minute gap between the 'end' of one stop and the 'start' of the next to account for travel time.

IMPORTANT:
- Respond with ONLY the valid JSON object.
- Do NOT wrap the response in markdown blocks (no \`\`\`json).
- Do NOT add any text before or after the JSON.
`
}