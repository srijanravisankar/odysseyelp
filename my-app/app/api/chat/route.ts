// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import type { ItineraryPlan } from "@/lib/itinerary-types"
import type { SurveyContext } from "@/components/chat-survey-header"

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
})

const model = "gemini-2.5-flash-lite"

// export async function POST(req: NextRequest) {
//     try {
//         const body = await req.json()
//         const query = body?.query as string | undefined
//         const survey = body?.survey as SurveyContext | undefined

//         if (!query) {
//             return NextResponse.json(
//                 { error: "Missing query" },
//                 { status: 400 },
//             )
//         }

//         const userLocation = body?.userLocation as { lat: number; lng: number } | undefined

//         const today = new Date().toLocaleDateString("en-US", {
//             weekday: 'long', 
//             year: 'numeric', 
//             month: 'long', 
//             day: 'numeric'
//         });

//         // 1) Compose Yelp-specific prompt from query (+ optional survey) via Gemini
//         const composedRes = await ai.models.generateContent({
//             model: model,
//             contents: [
//                 {
//                     role: "user",
//                     parts: [
//                         {
//                             text: buildGeminiPrompt({ query, survey, today }),
//                         },
//                     ],
//                 },
//             ],
//         })

//         const composedPrompt = (composedRes.text ?? "").trim()
//         if (!composedPrompt) {
//             return NextResponse.json(
//                 { error: "Gemini returned empty composed prompt" },
//                 { status: 500 },
//             )
//         }

//         if (composedPrompt === "SKIP_YELP" || composedPrompt === '"SKIP_YELP"') {
//             console.log("Skipping Yelp API call: Irrelevant query");
//             return NextResponse.json({
//                 composedPrompt: null,
//                 yelp: null,
//                 itinerary: null,
//                 message: "RETURN"
//             })
//         }

//         const latitude = userLocation?.lat || 43.6532;
//         const longitude = userLocation?.lng || -79.3832;

//         // 2) Call Yelp AI API with composed prompt
//         const yelpRes = await fetch("https://api.yelp.com/ai/chat/v2", {
//             method: "POST",
//             headers: {
//                 Authorization: `Bearer ${process.env.YELP_API_KEY}`,
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 query: composedPrompt,
//                 user_context: {
//                     locale: "en_CA",
//                     // TODO: later derive from survey.location if available
//                     latitude: latitude,
//                     longitude: longitude,
//                 },
//             }),
//         })

//         if (!yelpRes.ok) {
//             const text = await yelpRes.text()
//             console.error("Yelp error", text)
//             return NextResponse.json(
//                 { error: "Yelp AI API error", details: text },
//                 { status: 500 },
//             )
//         }

//         const yelpData: unknown = await yelpRes.json()

//         // 3) Ask Gemini to turn Yelp JSON into a clean ItineraryPlan
//         const itineraryPrompt = buildItineraryPrompt({
//             query,
//             survey,
//             composedPrompt,
//             yelpData,
//             today,
//         })

//         const itineraryRes = await ai.models.generateContent({
//             model: model,
//             contents: [
//                 {
//                     role: "user",
//                     parts: [{ text: itineraryPrompt }],
//                 },
//             ],
//         })

//         const rawItineraryText = (itineraryRes.text ?? "").trim()

//         let itinerary: ItineraryPlan | null = null
//         try {
//             const jsonString = extractJsonObject(rawItineraryText)
//             itinerary = JSON.parse(jsonString) as ItineraryPlan
//         } catch (e) {
//             console.error(
//                 "Failed to parse itinerary JSON from Gemini",
//                 e,
//                 rawItineraryText,
//             )
//         }

//         // 4) Return everything to the frontend
//         return NextResponse.json({
//             composedPrompt,
//             yelp: yelpData,
//             itinerary,
//         })
//     } catch (err) {
//         console.error(err)
//         return NextResponse.json(
//             { error: "Server error", details: String(err) },
//             { status: 500 },
//         )
//     }
// }

// ---------------------------------------------------------------------------
// Helper: strip ``` fences / extra text and extract the JSON object
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body?.query as string | undefined;
    const survey = body?.survey as SurveyContext | undefined;
    
    // ✅ 1. Receive the browser coordinates (passed from shell-header)
    const userLocation = body?.userLocation as { lat: number; lng: number } | undefined;

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    // ✅ 2. Get Today's Date (for relative dates like "this weekend")
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // -------------------------------------------------------------------------
    // STEP 1: Smart Prompt Engineering & Location Extraction
    // -------------------------------------------------------------------------
    const composedRes = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [{ text: buildGeminiPrompt({ query, survey, today }) }],
        },
      ],
    });

    const rawResponse = (composedRes.text ?? "").trim();
    
    // ✅ 3. Parse Gemini's JSON response
    // We expect: { "yelpQuery": "...", "location": "..." }
    let parsedPrompt: { yelpQuery: string; location: string | null } | null = null;
    
    try {
        const cleanedJson = extractJsonObject(rawResponse);
        parsedPrompt = JSON.parse(cleanedJson);
    } catch (e) {
        console.error("Failed to parse prompt JSON", rawResponse);
        // Fallback if Gemini fails to return JSON
        parsedPrompt = { yelpQuery: rawResponse, location: null };
    }

    if (!parsedPrompt?.yelpQuery || parsedPrompt.yelpQuery === "SKIP_YELP") {
       return NextResponse.json({ message: "RETURN" });
    }

    // -------------------------------------------------------------------------
    // STEP 2: Determine Yelp Context (The Fix)
    // -------------------------------------------------------------------------
    let yelpLocationObj: any = {};

    // PRIORITY 1: Explicit location found in query (e.g. "Paris")
    if (parsedPrompt.location && parsedPrompt.location !== "CURRENT_LOCATION") {
        console.log("📍 Using extracted location:", parsedPrompt.location);
        yelpLocationObj = { location: parsedPrompt.location };
    } 
    // PRIORITY 2: Explicit location from Survey
    else if (survey?.location?.area) {
        console.log("📍 Using survey location:", survey.location.area);
        yelpLocationObj = { location: survey.location.area };
    } 
    // PRIORITY 3: User's GPS Location (if query implies "near me")
    else if (userLocation) {
        console.log("📍 Using GPS coordinates");
        yelpLocationObj = { latitude: userLocation.lat, longitude: userLocation.lng };
    } 
    // PRIORITY 4: Default Fallback (Toronto)
    else {
        console.log("📍 Using default fallback");
        yelpLocationObj = { location: "Toronto, ON" };
    }

    // -------------------------------------------------------------------------
    // STEP 3: Call Yelp AI API
    // -------------------------------------------------------------------------
    const yelpRes = await fetch("https://api.yelp.com/ai/chat/v2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: parsedPrompt.yelpQuery,
        user_context: {
          locale: "en_CA",
          ...yelpLocationObj, // Spread the decided location logic here
        },
      }),
    });

    if (!yelpRes.ok) {
      const text = await yelpRes.text();
      return NextResponse.json({ error: "Yelp error", details: text }, { status: 500 });
    }

    const yelpData: unknown = await yelpRes.json();

    // -------------------------------------------------------------------------
    // STEP 4: Generate Itinerary Plan
    // -------------------------------------------------------------------------
    const itineraryPrompt = buildItineraryPrompt({
      query,
      survey,
      composedPrompt: parsedPrompt.yelpQuery,
      yelpData,
      today,
    });

    const itineraryRes = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: itineraryPrompt }] }],
    });

    const rawItineraryText = (itineraryRes.text ?? "").trim();
    let itinerary: ItineraryPlan | null = null;
    try {
      const jsonString = extractJsonObject(rawItineraryText);
      itinerary = JSON.parse(jsonString) as ItineraryPlan;
    } catch (e) {
      console.error("Failed to parse itinerary JSON", e);
    }

    return NextResponse.json({ 
        composedPrompt: parsedPrompt.yelpQuery, 
        yelp: yelpData, 
        itinerary 
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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
                                today,
                           }: {
    query: string
    survey?: SurveyContext
    today: string
}) {
    const relevanceInstructions = `
    FIRST, analyze if the user's request is asking for recommendations, places, businesses, itineraries, or travel planning.
    - If the user is just saying "hello", "how are you", talking about code, or asking general knowledge questions unrelated to places/travel: RETURN ONLY THE STRING "SKIP_YELP".
    - If the user IS asking for places/travel (e.g. "coffee near me", "plan a trip", "restaurants"): Proceed to generate the Yelp query.
    `
    const dateInstructions = `
    Context: Today is ${today}.
    - If the user says "this weekend" or "next Friday", calculate the specific date based on ${today}.
    - If no date is mentioned, assume the trip is for ${today}.
    `

    if (survey) {
        // Build context from the simplified survey structure
        let context = '';

        if (survey.location?.area) {
            context += `Location: ${survey.location.area}. `;
        }

        if (survey.location?.dateRange?.start && survey.location?.dateRange?.end) {
            context += `Travel dates: ${survey.location.dateRange.start} to ${survey.location.dateRange.end}. `;
        }

        if (survey.trip?.type) {
            const tripTypeMap: Record<string, string> = {
                solo: 'solo traveler',
                date: 'romantic date',
                friends: 'group of friends',
                family: 'family trip',
                work: 'business trip'
            };
            context += `Trip type: ${tripTypeMap[survey.trip.type] || survey.trip.type}. `;
        }

        if (survey.trip?.people) {
            context += `Party size: ${survey.trip.people} ${survey.trip.people === 1 ? 'person' : 'people'}. `;
        }

        if (survey.budget?.priceLevel) {
            const budgetMap: Record<string, string> = {
                '$': 'budget-friendly (under $10 per person)',
                '$$': 'moderate ($11-30 per person)',
                '$$$': 'upscale ($31-60 per person)',
                '$$$$': 'fine dining ($61+ per person)'
            };
            context += `Budget: ${budgetMap[survey.budget.priceLevel] || survey.budget.priceLevel}. `;
        }

        if (survey.food?.dietary && survey.food.dietary.length > 0) {
            context += `Dietary requirements: ${survey.food.dietary.join(', ')}. `;
        }

        return `
You are a prompt engineer helping to talk to the Yelp AI API.

${relevanceInstructions}

${dateInstructions}

The user provided this context:
${context}

The user then typed this message:
"${query}"

Using the context and message, craft a single, clear query string that will be sent
to the Yelp AI API (https://api.yelp.com/ai/chat/v2).

Make sure your query:
- Incorporates the location, dates, trip type, party size, budget, and dietary requirements from the context
- Maintains the user's original intent from their message
- Uses natural, conversational language like a human would ask
- Is specific and actionable for Yelp to find relevant businesses

**Your Task:**
1. **Extract the Location:**
   - Did the user mention a specific city, neighborhood, or place? (e.g. "Sushi in Tokyo", "Trip to Paris").
   - If YES -> Extract that location string.
   - If NO (e.g. "Coffee near me", "Plan a date night") -> Return "CURRENT_LOCATION".
2. **Draft the Yelp Query:**
   - Write a specific search query for Yelp (e.g., "Best sushi restaurants", "Romantic dinner spots").
   - Your query must ask the Yelp to create 8-10 recommendations.
   - **CRITICAL:** Do NOT include the location name in this query string (Yelp handles that separately).

**Output Format:**
{
  "yelpQuery": "string or SKIP_YELP",
  "location": "string or CURRENT_LOCATION"
}

IMPORTANT:
- You must respond with ONLY a valid JSON object.
- Do NOT use markdown formatting (no \`\`\`json).
- Keep it concise but include all relevant details.
`
    }

    // No survey: just rely on the free-text query
    return `
You are a prompt engineer helping to talk to the Yelp AI API.

${relevanceInstructions}

${dateInstructions}

The user did NOT provide any structured survey, only this free-text message:
"${query}"

Rewrite this message as a single, clear query string that will be sent directly
to the Yelp AI API (https://api.yelp.com/ai/chat/v2).

**Your Task:**
1. **Extract the Location:**
   - Did the user mention a specific city, neighborhood, or place? (e.g. "Sushi in Tokyo", "Trip to Paris").
   - If YES -> Extract that location string.
   - If NO (e.g. "Coffee near me", "Plan a date night") -> Return "CURRENT_LOCATION".
2. **Draft the Yelp Query:**
   - Write a specific search query for Yelp (e.g., "Best sushi restaurants", "Romantic dinner spots").
   - Your query must ask the Yelp to create 8-10 recommendations.
   - **CRITICAL:** Do NOT include the location name in this query string (Yelp handles that separately).

**Output Format:**
You must respond with ONLY a valid JSON object:
{
  "yelpQuery": "string or SKIP_YELP",
  "location": "string or CURRENT_LOCATION"
}

IMPORTANT:
- You must respond with ONLY a valid JSON object.
- Do NOT use markdown formatting (no \`\`\`json).
- Keep it concise but include all relevant details.
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
  today,
}: {
  query: string
  survey?: any // formatted to your SurveyContext type
  composedPrompt: string
  yelpData: unknown
  today: string
}) {
  return `
You are helping generate a structured itinerary object for a UI.

Today's Date:
${today}

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
  icon: "coffee" | "food" | "bar" | "walk" | "music" | "art" | "shopping" | "landmark" | "ticket" | "default"
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
  location: string | null
  date: string | null
  center: { lat: number; lng: number }
  stops: ItineraryStop[]
}

Rules:
1. **Use Yelp Data:** Fill metadata (rating, coordinates, etc.) exactly from the Yelp response.
2. **IDs:** Use unique strings "stop-1", "stop-2", etc.
3. **Icon Selection:** Choose the icon string that best matches the stop's category.
   - "coffee" (Cafes, Bakeries)
   - "food" (Restaurants, Lunch, Dinner)
   - "bar" (Bars, Pubs, Nightlife)
   - "walk" (Parks, Hiking, Walking)
   - "music" (Concerts, Jazz Clubs)
   - "art" (Museums, Galleries)
   - "shopping" (Malls, Boutiques)
   - "landmark" (Sightseeing, Monuments)
   - "ticket" (Events, Shows)
   - "default" (Everything else)
4. **Map Center:** center.lat/lng must be the average of all stops.
5. **Contextual Info:** title/summary must reflect the user's specific intent (e.g., "Quiet Anniversary Dinner").
6. **Location Name:** Extract the primary city or area name from the stops and populate the 'location' field (e.g., "Seattle, WA" or "Downtown Toronto").

**CRITICAL SCHEDULING RULES:**

1. **DATES & DURATION:**
   - **Start Date Priority:** Determine the start date in this order:
     1. Survey "dateRange" (if provided).
     2. Explicit User Request (e.g., "Dec 25th" -> Use 2025-12-25).
     3. Relative User Request (e.g., "This weekend" -> Calculate based on Today: ${today}).
     4. **Default:** If NO date is mentioned, strictly use Today: **${today}**.
   - **Multi-Day Strategy:** If the user requests multiple days (e.g., "3 day trip"):
     - You MUST generate stops across multiple distinct dates.
     - Day 1 = Start Date, Day 2 = Start Date + 1, etc.
     - Evenly distribute stops (e.g., 3-4 stops per day) rather than cramming everything into Day 1.
2. **TIME BOUNDARIES:**
   - **Contextual Inference:** Respect cues like "morning coffee" (start ~8 AM) or "late night bars" (end ~1 AM).
   - **Default Hours:** If no specific time preference is found, assume a standard day of **10:00 AM to 8:00 PM**.
3. **PACING & CONTENT:**
   - **Maximize Places:** Fill the itinerary with valid businesses from the Yelp data, up to a **maximum of 10 stops** total.
   - **Sequence:** Stops must be ordered strictly chronologically by date and time.
4. **REALISTIC DURATIONS (Apply these strictly):**
   - **Coffee/Bakery:** 30-45 mins
   - **Lunch/Dinner:** 60-90 mins
   - **Museum/Activity:** 90-120 mins
   - **Park/Walk:** 45-60 mins
   - **Bar/Drinks:** 60-90 mins
5. **LOGISTICS & BUFFERS:**
   - **No Overlaps:** The "start" of a stop must be strictly AFTER the "end" of the previous stop.
   - **Travel Buffers:** You MUST insert a **15-30 minute gap** between the end of one stop and the start of the next to account for travel time.

IMPORTANT:
- Respond with ONLY the valid JSON object.
- Do NOT wrap the response in markdown blocks (no \`\`\`json).
- Do NOT add any text before or after the JSON.

CRITICAL: You MUST return the complete ItineraryPlan object with this EXACT structure:
`
}