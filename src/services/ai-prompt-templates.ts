export const INTENT_EXTRACTION_TEMPLATE = `
Analyze this beauty salon query and extract structured intent:
Query: "{query}"

Return a JSON object with:
- type: "search" | "recommend" | "summarize" | "insight" | "description"
- services: string[] (mentioned beauty services)
- budget: { min: number, max: number } | null
- area: string | null (Mumbai area)
- date: string | null (mentioned date)
- time: string | null (mentioned time)
- gender: "women" | "men" | "unisex" | null
- is_home_service: boolean | null
- is_luxury: boolean | null
`

export const RECOMMENDATION_TEMPLATE = `
Based on the user's preferences and intent, explain why these salons match:
Intent: {intent}
Matched Salons: {salons}

Generate a natural, friendly explanation highlighting:
1. Why each salon matches their specific needs
2. How the services align with their preferences
3. Notable features (ratings, pricing, location)
`

export const REVIEW_SUMMARY_TEMPLATE = `
Summarize these customer reviews for a beauty salon:
Reviews: {reviews}

Return a JSON object with:
- summary: string (2-3 sentence overview of customer sentiment)
- sentiment: "positive" | "mixed" | "negative"
- topThemes: string[] (top 3-5 recurring themes in reviews)
- positivePoints: string[] (what customers love)
- improvementAreas: string[] (what could be better)
`

export const PROFILE_INSIGHT_TEMPLATE = `
Analyze this beauty profile and booking history:
Profile: {profile}
Bookings: {bookings}

Generate personalized insights including:
1. Beauty preferences and patterns
2. Recommended services based on history
3. Budget optimization suggestions
4. Area and salon preferences
5. Next best appointment suggestion
`

export const SALON_DESCRIPTION_TEMPLATE = `
Generate a compelling, professional description for this beauty salon:
Name: {name}
Specialties: {specialties}
Location: {area}, Mumbai
Target Audience: {gender}
Price Range: {priceRange}
Amenities: {amenities}

Write a warm, inviting description that highlights the salon's unique value proposition.
`

export const SERVICE_DESCRIPTION_TEMPLATE = `
Write an attractive service description for:
Service: {name}
Category: {category}
Duration: {duration}
Price: {price}
Salon: {salonName}

Create a compelling description that highlights benefits and results.
`
