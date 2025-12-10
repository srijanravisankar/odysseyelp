import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(req: NextRequest) {
    try {
        const { query, survey } = await req.json()

        if (!query || !survey) {
            return NextResponse.json(
                { error: "Missing query or survey" },
                { status: 400 },
            )
        }

        // 1) Ask Gemini to compose a Yelp-specific prompt
        const composed = await ai.models.generateContent({
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

        // ✅ FIX: use composed.text instead of composed.response.text()
        const composedPrompt = (composed.text ?? "").trim()

        if (!composedPrompt) {
            return NextResponse.json(
                { error: "Gemini returned empty text" },
                { status: 500 },
            )
        }

        // 2) Call Yelp AI API with that composed prompt
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
                    // later: read from survey.location; for now default to Toronto like your TouringMap
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

        const yelpData = await yelpRes.json()

        // 3) Return Yelp’s response to the frontend
        return NextResponse.json({
            composedPrompt,
            yelp: yelpData,
        })
    } catch (err) {
        console.error(err)
        return NextResponse.json(
            { error: "Server error", details: String(err) },
            { status: 500 },
        )
    }
}

// Helper: convert your survey + query into instructions for Gemini
function buildGeminiPrompt({
                               query,
                               survey,
                           }: {
    query: string
    survey: any
}) {
    return `
You are a prompt engineer helping to talk to the Yelp AI API.

The user filled this trip survey (JSON):
${JSON.stringify(survey, null, 2)}

The user then typed this message:
"${query}"

Using the survey and message, craft a single, clear query string that will be sent to the Yelp AI API (https://api.yelp.com/ai/chat/v2).

Make sure your query:
- Specifies location (city/area) from the survey if present
- Includes dietary restrictions and preferences
- Includes vibe, budget, and time of day if present
- Uses natural language like a human user

IMPORTANT:
- Reply with ONLY the final query string and nothing else.
- Do not add explanations, markdown, or JSON.
`
}
