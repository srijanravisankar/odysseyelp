# Odysseyelp — Project Summary

## Inspiration

Odysseyelp was inspired by the desire to combine local discovery (like Yelp) with an intelligent, conversational trip planner. We aimed to make discovery, itinerary generation, collaboration, and visualization part of one cohesive flow so users can plan multi-stop trips quickly and share them with friends.

## What it does

- Conversational trip planning using a chat interface backed by generative AI to create itineraries and refine results interactively.
- Multiple chat sessions for separate trips, each with persistent history and saved itineraries.
- Itinerary editing and management (add/remove stops, save to My Space, modify, delete).
- Interactive Mapbox-powered map with stop markers, route visualization, and route optimization via Mapbox Optimization API.
- Planner Calendar view to organize trips by date and visualize events.
- Group collaboration: create groups, generate secret invite codes, join groups, and maintain shared wish-lists.
- Explore page to discover published itineraries with fuzzy search, tag filters, and sorting.
- Responsive UI with theme support, toasts, modals, and smooth animations.

## How we built it

- Framework: Next.js 16 (React 19) with the app-router and server/client components.
- Language: TypeScript for stronger developer ergonomics and fewer runtime errors.
- Styling & UI library: Tailwind CSS and Radix UI primitives; custom component library for cards, buttons, and dialogs.
- Maps & routing: Mapbox GL for rendering, Mapbox Optimization API for route calculations.
- AI: Google Generative AI for natural-language itinerary generation and suggestions.
- Backend & auth: Supabase (Postgres + Auth) for persistence, authentication, and server-side functions.
- State management: React Contexts for user, chat/session, itinerary, and group state.
- Notable libraries: Sonner for notifications, lucide-react icons, date-fns.

## Challenges we ran into

- Provider placement bugs: some components attempted to use itinerary context before the provider was mounted, causing runtime errors. We resolved this by ensuring `ItineraryProvider` wraps the dashboard route segment.
- Stuck loading state: `loadingItineraries` could remain true if fetch logic returned early due to missing session/auth; fixed by explicitly clearing the loading flag on early returns and improving error handling.
- Scroll and layout issues: Scroll areas inside flex containers could expand and overflow; solution was `flex-1 min-h-0` + `overflow-auto` patterns and careful parent sizing.
- Hover visibility: naive `group-hover` usage caused multiple buttons to appear; fixed by tracking hovered item ID in state so only the hovered item’s action shows.
- Async timing with Supabase: many fetches require valid auth; we added defensive checks and clearer messaging for auth-related states.
- Merge conflicts: encountered modify/delete conflicts that required careful inspection and choosing the correct resolution.

## Accomplishments that we're proud of

- Full end-to-end trip flow: generate itineraries via chat, visualize stops on a map, optimize routes, and save plans in a unified UI.
- Group collaboration features: secret invite codes, member lists, and shared wish-lists enable collaborative planning.
- Explore & discovery: browse and search published itineraries with a polished grid UI and detailed modal views.
- UX and polish: accessible components, toasts, confirmation dialogs, responsive layouts, and animation improve user experience.
- Real integrations: working Mapbox optimization and Supabase-backed persistence show production readiness.

## What we learned

- The order and placement of React providers matter — hooks fail if you call them outside their provider.
- `min-h-0` and `flex-1` are key to controlling inner scroll behavior in flex layouts.
- Always handle every control-flow exit (including early returns and errors) to reset loading and state flags.
- Small UX details (current user badge, hover visibility, toast feedback) significantly improve perceived quality.
- Database RPCs and Supabase require careful error handling and secure server-side checks for group join flows.

## What's next for Odysseyelp

- Short-term:
  - Improve error and empty-state UI (clearer messages when unauthenticated or when no itineraries exist).
  - Consolidate duplicate contexts and imports to avoid accidental mixed usage of similarly named providers.
  - Add more robust unit and integration tests for key flows (itinerary fetch, session creation, group join).
  - Performance: add server-side paging and caching for the Explore page.

- Medium-term:
  - Real-time collaboration via Supabase Realtime or WebSockets for shared itinerary edits and group updates.
  - Itinerary export (PDF, iCal) and shareable public links.
  - Ratings, comments, and social features to grow community engagement.
  - Mobile-first improvements and PWA support.

- Long-term:
  - Native mobile apps or a dedicated companion app.
  - Integrations with booking APIs (hotels, transport) and live availability checks.
  - Personalization and recommendation engines based on user activity and preferences.

---

_Last updated: December 2025_
