export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Safe request body parsing to guard against undefined body or raw strings
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
  const { industry, market, language } = body

  // Server-side validation allowlist
  const VALID_INDUSTRIES = [
    'industry_automotive', 'industry_electronics', 'industry_machinery', 
    'industry_textiles', 'industry_chemicals', 'industry_pharma', 
    'industry_food', 'industry_logistics', 'industry_other'
  ]
  const VALID_MARKETS = [
    'any', 'market_us', 'market_eu', 'market_uk', 'market_asean', 
    'market_gcc', 'market_latam', 'market_africa', 'market_sa', 'market_anz'
  ]

  if (!industry || !market || !VALID_INDUSTRIES.includes(industry) || !VALID_MARKETS.includes(market)) {
    return res.status(400).json({ 
      error: 'Invalid input parameters', 
      detail: 'The provided industry or market is missing or not supported.' 
    })
  }

  let langInstruction = ''
  if (language === 'ZH') langInstruction = 'ALL string values in the JSON must be written in Simplified Chinese (中文简体). Do not use English for any values, only keys stay in English.'
  if (language === 'TW') langInstruction = 'ALL string values in the JSON must be written in Traditional Chinese (中文繁體). Do not use English for any values, only keys stay in English.'

  const systemPrompt = `You are a senior B2B export intelligence analyst with 20+ years advising Chinese manufacturers on entering foreign markets. You have deep insider knowledge of trade flows, procurement behavior, platform algorithms, and common failure modes.

Your task: produce a data-rich, specific intelligence report for a ${industry} manufacturer targeting ${market}.

Respond ONLY with valid JSON. No preamble, no markdown, no code fences. ${langInstruction}

The JSON must have EXACTLY these keys and follow this structural format:

{
  "opportunity_scores": [
    { "label": "Market Size", "score": 75 },
    { "label": "Entry Ease", "score": 60 },
    { "label": "Competition", "score": 80 },
    { "label": "Margin Potential", "score": 65 },
    { "label": "Growth Rate", "score": 70 }
  ],
  "buyer_regions": [
    { "country": "Germany", "concentration": 35, "note": "Largest importer of industrial machinery in EU" }
  ],
  "buyer_criteria_radar": [
    { "label": "Price", "value": 85 },
    { "label": "Quality", "value": 90 },
    { "label": "Certifications", "value": 95 },
    { "label": "Lead Time", "value": 70 },
    { "label": "MOQ Flex", "value": 60 },
    { "label": "After-Sales", "value": 75 }
  ],
  "platform_scores": [
    { "name": "Alibaba", "score": 85, "tier": "PRIMARY" }
  ],
  "outreach_channels": [
    "Hannover Messe 2025"
  ],
  "outreach_detail": [
    "Message procurement managers directly on LinkedIn — use local language intro, attach CE certificate in first message"
  ],
  "mistakes_structured": [
    { "mistake": "Failing to secure CE markings prior to shipping, causing custom seizures.", "severity": "HIGH" }
  ]
}

Structural Rules for Lists:
- "buyer_regions": Provide 5-7 specific countries with real concentration percentages that sum to approximately 100, each with a short insider note.
- "platform_scores": Provide 6-8 real platforms specific to the industry/market, scored by actual buyer traffic and conversion. Use tiers: PRIMARY, SECONDARY, or NICHE.
- "outreach_channels": Provide 3-6 short action-oriented channel names.
- "outreach_detail": Provide 3-4 specific insider tactics with concrete detail.
- "mistakes_structured": Provide 5-6 mistakes total, at least 2 HIGH severity (HIGH or MED), specific to this industry/market.

Be ruthlessly specific. Name real trade shows, real platforms, real certification requirements (CE, FCC, ISO numbers), real countries with real import data context. This should read like a briefing from someone who has done this for 20 years, not a generic overview.`

  const fallbackResponse = {
    opportunity_scores: [],
    buyer_regions: [],
    buyer_criteria_radar: [],
    platform_scores: [],
    outreach_channels: [],
    outreach_detail: [],
    mistakes_structured: []
  }

  try {
    const groqRes = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Industry: ${industry}\nTarget market: ${market}` },
          ],
          max_tokens: 2000,
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      }
    )

    const data = await groqRes.json()

    if (!groqRes.ok) {
      console.error('Groq error:', data.error)
      return res.status(502).json({ error: 'Groq API error', detail: data.error?.message })
    }

    const raw = data.choices?.[0]?.message?.content
    if (!raw) {
      console.error('No content in Groq response:', data)
      return res.status(502).json({ error: 'No response from Groq' })
    }
    
    try {
      // Clean occasional markdown blocks that LLM engines produce despite JSON Mode
      const cleanedRaw = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanedRaw)
      return res.status(200).json(parsed)
    } catch (parseErr) {
      console.error('JSON Parse Error:', parseErr)
      console.error('Raw text attempted to parse:', raw)
      return res.status(200).json(fallbackResponse)
    }
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: 'Failed to generate market guide', detail: err.message })
  }
}
