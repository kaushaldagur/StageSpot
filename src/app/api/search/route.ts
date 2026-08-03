import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// AI provider for query expansion (PRD 5.5: "provider to be confirmed").
// Uses Gemini when GEMINI_API_KEY is set, else Claude when ANTHROPIC_API_KEY
// is set, else the keyword heuristic below — the feature works either way.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// Server-side client: the browser anon client has no session inside a route
// handler, and RLS only exposes approved profiles to authenticated users.
// This client is used strictly for read-only search over approved profiles.
function getServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

async function searchApproved(supabase: ReturnType<typeof getServerClient>, filters: { act_types: string[]; keywords: string[] }) {
  let query = supabase
    .from('performer_profiles')
    .select('*')
    .eq('verification_status', 'approved')
    .limit(20)

  if (filters.act_types.length > 0) {
    // act_type values are stored capitalized (Music, Comedy, Poetry)
    query = query.in('act_type', filters.act_types.map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()))
  }

  if (filters.keywords.length > 0) {
    const ors = filters.keywords
      .map(k => k.replace(/[,%()]/g, '').trim())
      .filter(Boolean)
      .flatMap(k => [`name.ilike.%${k}%`, `bio.ilike.%${k}%`])
    if (ors.length > 0) query = query.or(ors.join(','))
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Maps common words to act types so the no-API-key fallback still routes
// "comedy" / "stand-up" / "singer" style queries to the right category
const ACT_TYPE_SYNONYMS: Record<string, string> = {
  music: 'music', musician: 'music', singer: 'music', song: 'music', acoustic: 'music',
  guitar: 'music', jazz: 'music', band: 'music', vocalist: 'music',
  comedy: 'comedy', comedian: 'comedy', 'stand-up': 'comedy', standup: 'comedy', funny: 'comedy',
  poetry: 'poetry', poet: 'poetry', 'spoken-word': 'poetry', spoken: 'poetry', verse: 'poetry',
}

function heuristicFilters(query: string, chips: string[]) {
  const tokens = [query, ...chips]
    .filter(Boolean)
    .flatMap(s => s.toLowerCase().split(/[\s,]+/))
    .filter(Boolean)

  const act_types = Array.from(new Set(tokens.map(t => ACT_TYPE_SYNONYMS[t]).filter(Boolean)))
  const keywords = tokens.filter(t => !ACT_TYPE_SYNONYMS[t] && t.length > 2)
  return { act_types, keywords }
}

function buildExpansionPrompt(query: string, chips: string[]) {
  return `You are a search filter expander for a live performance marketplace.

User query: "${query}"
Selected chips: ${chips.join(', ') || 'none'}

Expand this into a JSON object with:
- act_types: array drawn from ["music", "comedy", "poetry"]
- keywords: array of short keywords to match against performer name/bio

Return ONLY valid JSON, no markdown.

Example output:
{"act_types": ["music"], "keywords": ["acoustic", "folk"]}`
}

// Both providers return the same JSON contract; null means "use the heuristic"
async function expandWithGemini(prompt: string): Promise<string | null> {
  // "-latest" alias tracks the current flash model, so it won't go stale
  // the way pinned names do for new API keys
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          // headroom for models that spend internal "thinking" tokens,
          // which count toward this limit; the JSON itself is tiny
          maxOutputTokens: 4000,
        },
      }),
    }
  )
  if (!response.ok) return null
  const body = await response.json()
  return body.candidates?.[0]?.content?.parts?.[0]?.text ?? null
}

async function expandWithClaude(prompt: string): Promise<string | null> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!response.ok) return null
  const body = await response.json()
  return body.content?.find((b: any) => b.type === 'text')?.text ?? null
}

export async function POST(request: NextRequest) {
  try {
    const { query, chips } = await request.json()
    const supabase = getServerClient()

    let filters = heuristicFilters(query || '', chips || [])

    // Expand the natural language query into structured filters (PRD 5.5)
    if ((GEMINI_API_KEY || ANTHROPIC_API_KEY) && query) {
      try {
        const prompt = buildExpansionPrompt(query, chips || [])
        const text = GEMINI_API_KEY
          ? await expandWithGemini(prompt)
          : await expandWithClaude(prompt)
        if (text) {
          const parsed = JSON.parse(text)
          filters = {
            act_types: Array.isArray(parsed.act_types) ? parsed.act_types : [],
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : filters.keywords,
          }
        }
      } catch {
        // fall through to keyword search with the raw query
      }
    }

    if (filters.act_types.length === 0 && filters.keywords.length === 0) {
      return NextResponse.json({ performers: [], suggestedFilters: filters })
    }

    // Run act-type and keyword searches, then merge with a relevance score
    const [byType, byKeyword] = await Promise.all([
      filters.act_types.length > 0
        ? searchApproved(supabase, { act_types: filters.act_types, keywords: [] })
        : Promise.resolve([]),
      filters.keywords.length > 0
        ? searchApproved(supabase, { act_types: [], keywords: filters.keywords })
        : Promise.resolve([]),
    ])

    const performerMap = new Map<string, any>()
    for (const p of [...byType, ...byKeyword]) {
      const existing = performerMap.get(p.id)
      performerMap.set(p.id, { ...p, relevanceScore: (existing?.relevanceScore || 0) + 1 })
    }

    const performers = Array.from(performerMap.values())
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0) || (b.rating || 0) - (a.rating || 0))
      .slice(0, 20)

    return NextResponse.json({ performers, suggestedFilters: filters })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed', performers: [] }, { status: 500 })
  }
}
