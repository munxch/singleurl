import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { QueryIntent, TargetSite, RequiredInput, SITE_CATALOGS } from '@/types/orchestrator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ParsedQueryResponse {
  intent: QueryIntent;
  subject: string;
  goal: string;
  needsClarification: boolean;
  clarifyingQuestions: RequiredInput[];
  suggestedSites: TargetSite[];
  reasoning: string;
}

const SYSTEM_PROMPT = `You are a query analyzer for Mino, a multi-site search tool that goes BEYOND what Google can do. We search sites that require logins, deep navigation, or real-time price data that search engines can't access.

1. **Intent** - What type of search is this?
   - price_comparison: Looking for best prices on products
   - vehicle_search: Cars, trucks, motorcycles
   - real_estate: Houses, apartments, rentals
   - travel: Flights, hotels, vacation packages
   - quote_request: Insurance quotes (ALWAYS needs clarification)
   - availability_check: Checking if something is in stock
   - information_lookup: Finding business info, hours, locations
   - research: General research/learning
   - general: Anything else

2. **Subject** - The main thing being searched for

3. **Goal** - What the user wants to accomplish

4. **Clarification** - RULES BY INTENT:

   FOR price_comparison: Ask 1-2 quick questions:
   - "condition": select with options ["new", "refurbished", "open-box", "any"] - ALWAYS include
   - "notes": text field for any specifics (color, storage size, etc.) - ALWAYS include

   FOR quote_request (insurance): This is HIGH-STAKES. ALWAYS ask for:
   - "zip_code": text, required - "What's your ZIP code?"
   - "age": number, required - "How old are you?"
   - "vehicle_year": text, required - "What year is your vehicle?"
   - "vehicle_make_model": text, required - "What's the make and model?"
   - "driving_history": select ["clean", "1-2 minor incidents", "major incidents"], required
   - "current_coverage": select ["none", "basic/liability only", "full coverage"], required
   - "notes": text, optional - "Any other details? (homeowner, good student, etc.)"

   FOR vehicle_search: May ask about new vs used, budget

5. **Recommended sites** - Pick 5-7 sites. Include specialty/niche sites that Google can't search:

AVAILABLE SITES (updated catalog):
- price_comparison: amazon, bestbuy, walmart, bhphoto, microcenter, slickdeals, costco, backmarket, woot, apple, target, newegg
- vehicle_search: autotrader, cargurus, carscom, carmax, carvana, truecar, edmunds, kbb
- real_estate: zillow, redfin, realtor, trulia, apartments
- travel: google_flights, kayak, expedia, skyscanner, hopper, southwest
- quote_request: geico, progressive, statefarm, allstate, libertymutual, thezebra, usaa, nationwide, farmers
- availability_check: amazon, target, walmart
- information_lookup: google, yelp, maps
- research: google, wikipedia
- general: google

IMPORTANT:
- For price_comparison, prioritize specialty sites (bhphoto, microcenter, slickdeals) alongside major retailers
- For quote_request, ALWAYS set needsClarification to true
- A "Chevy Tahoe" is a VEHICLE, not a product - use vehicle_search sites!

Respond with JSON only:
{
  "intent": "price_comparison",
  "subject": "AirPods Pro",
  "goal": "find best price",
  "needsClarification": true,
  "clarifyingQuestions": [
    {"key": "condition", "label": "Condition preference", "type": "select", "options": [{"value": "new", "label": "New only"}, {"value": "refurbished", "label": "Refurbished OK"}, {"value": "open-box", "label": "Open-box OK"}, {"value": "any", "label": "Any condition"}], "required": true},
    {"key": "notes", "label": "Any specific requirements?", "type": "text", "placeholder": "e.g., need USB-C case, specific color...", "required": false}
  ],
  "suggestedSites": ["amazon", "bestbuy", "bhphoto", "microcenter", "slickdeals", "walmart"],
  "reasoning": "Price comparison with specialty electronics retailers that often beat major retailer prices"
}`;

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      // Fallback to basic parsing if no API key
      return NextResponse.json(fallbackParse(query));
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this query: "${query}"` },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(fallbackParse(query));
    }

    // Parse the JSON response
    const parsed = JSON.parse(content) as {
      intent: QueryIntent;
      subject: string;
      goal: string;
      needsClarification: boolean;
      clarifyingQuestions: RequiredInput[];
      suggestedSites: string[];
      reasoning: string;
    };

    // Map site IDs to full TargetSite objects
    const siteCatalog = SITE_CATALOGS[parsed.intent] || SITE_CATALOGS.general;
    const suggestedSites: TargetSite[] = parsed.suggestedSites.map((siteId, index) => {
      const existingSite = siteCatalog.find(s => s.id === siteId);
      if (existingSite) {
        return { ...existingSite, selected: index < 6 }; // Select first 6
      }
      // If site not in catalog, check all catalogs
      for (const catalog of Object.values(SITE_CATALOGS)) {
        const found = catalog.find(s => s.id === siteId);
        if (found) return { ...found, selected: index < 6 };
      }
      // Fallback for unknown site
      return {
        id: siteId,
        name: siteId.charAt(0).toUpperCase() + siteId.slice(1),
        domain: `${siteId}.com`,
        selected: index < 6,
        estimatedTime: 15,
      };
    });

    const result: ParsedQueryResponse = {
      intent: parsed.intent,
      subject: parsed.subject,
      goal: parsed.goal,
      needsClarification: parsed.needsClarification && parsed.clarifyingQuestions.length > 0,
      clarifyingQuestions: parsed.clarifyingQuestions || [],
      suggestedSites,
      reasoning: parsed.reasoning,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Parse query error:', error);

    // If JSON parsing failed or other error, use fallback
    const { query } = await request.json().catch(() => ({ query: '' }));
    return NextResponse.json(fallbackParse(query || 'search'));
  }
}

// Fallback parser when OpenAI isn't available
function fallbackParse(query: string): ParsedQueryResponse {
  const lowerQuery = query.toLowerCase();
  let intent: QueryIntent = 'general';
  let subject = query;
  let goal = 'find information';
  let needsClarification = false;
  let clarifyingQuestions: RequiredInput[] = [];

  // Detect price comparison queries
  if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('cheap') ||
      lowerQuery.includes('best deal') || lowerQuery.includes('best price') || lowerQuery.includes('find') ||
      lowerQuery.includes('airpod') || lowerQuery.includes('iphone') || lowerQuery.includes('macbook')) {
    intent = 'price_comparison';
    goal = 'find best price';

    // Extract the product name
    const priceMatch = query.match(/(?:price|cost|deal|find|best)(?:\s+(?:for|of|on|the))?\s+(.+?)(?:\s+(?:on|at|from|across))?$/i);
    if (priceMatch) subject = priceMatch[1].trim();

    // Always ask clarifying questions for price comparison
    needsClarification = true;
    clarifyingQuestions = [
      {
        key: 'condition',
        label: 'Condition preference',
        type: 'select',
        options: [
          { value: 'new', label: 'New only' },
          { value: 'refurbished', label: 'Refurbished OK' },
          { value: 'open-box', label: 'Open-box OK' },
          { value: 'any', label: 'Any condition' },
        ],
        required: true,
      },
      {
        key: 'notes',
        label: 'Any specific requirements?',
        type: 'text',
        placeholder: 'e.g., specific color, storage size, accessories needed...',
        required: false,
      },
    ];
  }
  // Detect insurance/quote queries
  else if (lowerQuery.includes('insurance') || lowerQuery.includes('quote') || lowerQuery.includes('coverage')) {
    intent = 'quote_request';
    goal = 'compare insurance quotes';
    subject = lowerQuery.includes('auto') || lowerQuery.includes('car') ? 'auto insurance' : 'insurance';

    // Insurance ALWAYS needs clarification
    needsClarification = true;
    clarifyingQuestions = [
      {
        key: 'zip_code',
        label: 'ZIP code',
        type: 'text',
        placeholder: 'e.g., 90210',
        required: true,
      },
      {
        key: 'age',
        label: 'Your age',
        type: 'number',
        placeholder: 'e.g., 32',
        required: true,
      },
      {
        key: 'vehicle_year',
        label: 'Vehicle year',
        type: 'text',
        placeholder: 'e.g., 2021',
        required: true,
      },
      {
        key: 'vehicle_make_model',
        label: 'Vehicle make & model',
        type: 'text',
        placeholder: 'e.g., Honda Accord',
        required: true,
      },
      {
        key: 'driving_history',
        label: 'Driving history',
        type: 'select',
        options: [
          { value: 'clean', label: 'Clean record' },
          { value: 'minor', label: '1-2 minor incidents' },
          { value: 'major', label: 'Major incidents' },
        ],
        required: true,
      },
      {
        key: 'current_coverage',
        label: 'Current coverage',
        type: 'select',
        options: [
          { value: 'none', label: 'None (new policy)' },
          { value: 'basic', label: 'Basic/liability only' },
          { value: 'full', label: 'Full coverage' },
        ],
        required: true,
      },
      {
        key: 'notes',
        label: 'Other details',
        type: 'text',
        placeholder: 'e.g., homeowner, good student, bundling...',
        required: false,
      },
    ];
  }
  else if (lowerQuery.includes('in stock') || lowerQuery.includes('available')) {
    intent = 'availability_check';
    goal = 'check availability';
  }
  else if (lowerQuery.includes('hours') || lowerQuery.includes('open')) {
    intent = 'information_lookup';
    goal = 'find information';
  }

  const suggestedSites = (SITE_CATALOGS[intent] || SITE_CATALOGS.general).map((site, i) => ({
    ...site,
    selected: i < 6,
  }));

  return {
    intent,
    subject,
    goal,
    needsClarification,
    clarifyingQuestions,
    suggestedSites,
    reasoning: 'Fallback parsing',
  };
}
