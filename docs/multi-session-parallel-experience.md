# The Orchestra: Multi-Session Parallel Query Experience

## Executive Summary

This document defines a new paradigm for web automation: **The Orchestra**. Instead of a single agent methodically visiting sites one by one, Mino deploys a coordinated ensemble of parallel sessions that work simultaneously, with intelligent aggregation that delivers answers—not data—as results flow in.

The experience transforms waiting into watching magic happen, and transforms results into actionable intelligence.

---

## Part I: The Philosophy

### From Solo to Symphony

The current model: One agent, one journey, sequential steps.
The new model: **Multiple agents, parallel journeys, unified result.**

Think of it like this:
- **Before**: Asking a personal assistant to check 5 stores for you (they visit each one, come back with notes)
- **After**: Having 5 assistants check simultaneously, coordinated by a conductor who synthesizes their findings into one clear answer

### The Three Promises

1. **Speed Through Parallelism**: What takes 2 minutes sequentially takes 25 seconds in parallel
2. **Answers Through Aggregation**: Raw data becomes synthesized intelligence
3. **Trust Through Transparency**: See the work happening without demanding attention

### Respecting User Time

The user's time is sacred. This means:
- **Start fast**: First results appear within seconds
- **Preview early**: Show what's coming before it's complete
- **Background capable**: Work continues even if user looks away
- **Interrupt gracefully**: User can stop early with partial results

---

## Part II: The Experience Arc

### Moment 0: The Blank Canvas (Pre-Query)

The user arrives to a space that feels **inviting, not intimidating**.

**Visual**: A single, centered input area with gentle ambient animation. The background subtly suggests depth—like looking into clear water. No chrome, no clutter.

**Copy**:
- Placeholder: "What would you like to know?"
- Below: Three example queries that rotate gently, showing range:
  - "Find the best price for AirPods Pro across major retailers"
  - "Compare home insurance quotes for a 2,000 sq ft house in Austin"
  - "What time does the DMV in downtown SF open tomorrow?"

**The Wii Remote Moment**: The interface looks so simple, you *want* to try it. There's no learning curve visible—just invitation.

---

### Moment 1: Query Understanding (The Enrichment)

User types: "find me the best price for airpods pro"

**What happens invisibly**:
1. NLP parses intent: price comparison
2. System identifies: product = AirPods Pro, goal = lowest price
3. Site selector activates: Amazon, Best Buy, Apple, Target, Walmart, Costco

**What the user sees**:
A gentle expansion below the input:

```
┌─────────────────────────────────────────────────────┐
│  🔍 find me the best price for airpods pro          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  I'll check these 6 sites for current prices:       │
│                                                     │
│  ○ Amazon       ○ Best Buy      ○ Apple            │
│  ○ Target       ○ Walmart       ○ Costco           │
│                                                     │
│  + Add another site                                 │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Preview of results:                                │
│  • Best price highlighted                           │
│  • Comparison table with shipping info              │
│  • Direct purchase links                            │
│                                                     │
│              [ Check Prices → ]                     │
│                                                     │
│  Usually takes about 25 seconds                     │
└─────────────────────────────────────────────────────┘
```

**Key Design Decisions**:
- Sites are pre-selected intelligently, but user can modify
- Output preview sets expectations for what they'll receive
- Time estimate builds trust
- Single primary action button

---

### Moment 2: The Handoff (Confidence Before Commitment)

The "Check Prices" button is the moment of delegation. It must feel:
- **Confident**: "I know what you want and I'll get it"
- **Bounded**: "This is what I'll do, nothing more"
- **Reversible**: "You can stop anytime"

**The Click**:
When user clicks, the input area gracefully transforms:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│      ◉ Checking 6 sites for AirPods Pro prices     │
│                                                     │
│         ━━━━━━━━━━━━━━━○─────────  3 of 6          │
│                                                     │
│              [ Stop and show results ]              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### Moment 3: The Orchestra in Motion (Parallel Execution)

This is where the magic becomes visible.

**The Visualization**:

Below the progress indicator, a new panel emerges—**The Orchestra View**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Amazon  │ │ Best Buy │ │  Apple   │ │  Target  │ │ Walmart  │  │
│  │   ████   │ │   ████   │ │   ██░░   │ │   ░░░░   │ │   ░░░░   │  │
│  │  $189 ✓  │ │  $199 ✓  │ │ loading  │ │ waiting  │ │ waiting  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  🏆 Best so far: $189 at Amazon (free Prime shipping)              │
│                                                                     │
│  [Expand to see live browsers →]                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**The Key Innovations**:

1. **Parallel Visibility**: Each site has its own "lane" showing status
2. **Progressive Results**: As prices are found, they appear immediately
3. **Live Winner**: "Best so far" updates dynamically as results flow in
4. **Optional Deep View**: User CAN watch live browsers, but doesn't have to

**States for Each Lane**:
- `waiting` - In queue, session not yet started
- `loading` - Browser navigating, page loading
- `searching` - Agent analyzing page, looking for price
- `complete` - Price found, showing result
- `error` - Failed, showing fallback

**The "Glimpse" Option**:

If user wants to see the magic, they can expand to see live browsers:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌──────────────────────────┐  ┌──────────────────────────┐        │
│  │      Amazon.com          │  │     BestBuy.com          │        │
│  │  ┌────────────────────┐  │  │  ┌────────────────────┐  │        │
│  │  │ [Live browser view]│  │  │  │ [Live browser view]│  │        │
│  │  │                    │  │  │  │                    │  │        │
│  │  │   AirPods Pro      │  │  │  │   Extracting...    │  │        │
│  │  │   $189.00          │  │  │  │                    │  │        │
│  │  └────────────────────┘  │  │  └────────────────────┘  │        │
│  │       ✓ Complete         │  │       ◐ Searching        │        │
│  └──────────────────────────┘  └──────────────────────────┘        │
│                                                                     │
│  [ ← Collapse ]                      +4 more running...            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Moment 4: Results Flow In (Live Aggregation)

As each session completes, results aggregate in real-time.

**The Aggregation Panel**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   AirPods Pro - Price Comparison                    ✓ 6/6 checked  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🏆 BEST PRICE                                               │   │
│  │                                                             │   │
│  │    Amazon: $189.00                                          │   │
│  │    ✓ Free shipping with Prime                               │   │
│  │    ✓ In stock, arrives Friday                               │   │
│  │                                                             │   │
│  │    [ View on Amazon → ]                                     │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   All prices found:                                                 │
│  ┌─────────────┬─────────┬──────────────┬─────────────────────┐    │
│  │ Retailer    │  Price  │  Shipping    │  Availability       │    │
│  ├─────────────┼─────────┼──────────────┼─────────────────────┤    │
│  │ Amazon    ★ │  $189   │  Free (Prime)│  In stock           │    │
│  │ Target      │  $189   │  Free $35+   │  In stock           │    │
│  │ Walmart     │  $194   │  Free        │  In stock           │    │
│  │ Costco      │  $194   │  Free        │  Members only       │    │
│  │ Best Buy    │  $199   │  Free        │  In stock           │    │
│  │ Apple       │  $249   │  Free        │  In stock           │    │
│  └─────────────┴─────────┴──────────────┴─────────────────────┘    │
│                                                                     │
│   💡 Insight: Amazon and Target tie at $189, but Amazon ships      │
│      faster with Prime. Target requires $35 minimum for free       │
│      shipping.                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Features**:

1. **Answer First**: The best option is prominently displayed, not buried in data
2. **Full Comparison**: Complete table for those who want details
3. **Synthesized Insight**: AI adds value beyond raw data
4. **Direct Action**: "View on Amazon" takes them directly to buy

---

### Moment 5: Next Actions (The After)

The experience doesn't end with results. We anticipate what comes next:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   What would you like to do?                                        │
│                                                                     │
│   [ 🛒 Buy from Amazon ]  [ 📊 Compare again later ]                │
│                                                                     │
│   [ 🔔 Alert me if price drops ]  [ 🔍 New search ]                │
│                                                                     │
│                                                                     │
│   ─────────────────────────────────────────────────────────────    │
│                                                                     │
│   Recent searches:                                                  │
│   • AirPods Pro prices (just now)                                  │
│   • Home insurance quotes (2 hours ago)                            │
│   • Flight prices to Tokyo (yesterday)                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part III: Multi-Session Architecture

### Session Orchestration

The **Orchestrator** is a new layer that:
1. Receives a parsed query with target sites
2. Spawns N parallel sessions (one per site)
3. Monitors all sessions simultaneously
4. Aggregates results as they complete
5. Synthesizes final answer when all complete (or timeout)

```
                    ┌─────────────┐
                    │   Query     │
                    │   Parser    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Orchestrator│
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Session 1│    │ Session 2│    │ Session 3│
    │ (Amazon) │    │(Best Buy)│    │ (Apple)  │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  Result  │    │  Result  │    │  Result  │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
                  ┌─────────────┐
                  │ Aggregator  │
                  │ & Synthesizer│
                  └──────┬──────┘
                         │
                         ▼
                  ┌─────────────┐
                  │   Answer    │
                  └─────────────┘
```

### State Management

**OrchestratorState**:
```typescript
interface OrchestratorState {
  queryId: string;
  originalQuery: string;
  parsedIntent: ParsedIntent;

  sessions: Map<string, SessionState>;

  aggregatedResults: AggregatedResult[];
  currentBest: AggregatedResult | null;

  status: 'preparing' | 'running' | 'completing' | 'complete' | 'error';
  progress: {
    total: number;
    completed: number;
    failed: number;
  };

  synthesis: Synthesis | null;
  nextActions: NextAction[];
}

interface SessionState {
  sessionId: string;
  targetSite: string;
  status: 'queued' | 'initializing' | 'navigating' | 'extracting' | 'complete' | 'error';
  streamingUrl?: string;
  result?: ExtractedResult;
  error?: string;
  startTime?: number;
  endTime?: number;
}
```

### Concurrency Limits

To avoid overwhelming the backend:
- **Default parallel limit**: 6 sessions
- **Staggered start**: 200ms between session spawns
- **Queue management**: If > 6 sites, queue remaining
- **Timeout handling**: 60s per session, 90s total

---

## Part IV: The Magical First Touch

### Zero-State Onboarding

When a user arrives for the first time, they should understand capabilities within 5 seconds.

**Option A: Ambient Demonstration**

The background subtly shows a ghosted version of the Orchestra in action:
- Faint browser windows appearing and working
- A ghosted results table populating
- All very subtle, like seeing fish beneath the surface

**Option B: Single Powerful Example**

Above the input, a rotating showcase of real results:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   "What's the best price for PS5 right now?"                       │
│                                                                     │
│   → Checked 8 retailers in 23 seconds                              │
│   → Best: $449 at Walmart (in stock)                               │
│                                                                     │
│   ──────────────────────────────────────────────────────────────   │
│                                                                     │
│   [ Ask your own question ]                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Option C: The "Try This" Nudge**

Next to the input, a small prompt that cycles:

```
Try asking: "Compare iPhone 15 Pro prices" ↵
```

The user can click to auto-fill, or type their own.

### Progressive Disclosure of Power

The interface reveals complexity only as needed:

1. **First query**: Simple input, auto-selected sites
2. **Second query**: Subtle "+Add sites" option appears
3. **Third query**: "Save this search" appears
4. **Power user**: Full control panel available via settings

---

## Part V: Edge Cases & Error Handling

### Partial Failures

If some sites fail, we still show results:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   Found prices from 4 of 6 sites                                   │
│                                                                     │
│   ⚠️ Couldn't reach: Costco (timeout), Target (blocked)            │
│                                                                     │
│   Best available: $189 at Amazon                                   │
│                                                                     │
│   [ Try failed sites again ]  [ Continue with results ]           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### No Results Found

If the product isn't found on any site:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   Couldn't find "AirPods Pro Max Ultra" on any checked sites       │
│                                                                     │
│   Did you mean:                                                    │
│   • AirPods Pro (2nd generation)                                   │
│   • AirPods Max                                                    │
│                                                                     │
│   [ Search for "AirPods Pro" ]  [ Try different sites ]           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### User Interruption

If user clicks "Stop and show results":

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   Stopped early — showing 3 of 6 results                           │
│                                                                     │
│   Best so far: $189 at Amazon                                      │
│                                                                     │
│   Still checking: Target, Walmart, Costco                          │
│                                                                     │
│   [ Stop all ]  [ Let remaining finish in background ]             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part VI: Background Operation

### The "Tab Away" Experience

When user switches tabs or windows, Mino continues working:

**Browser Notification (if permitted)**:
```
Mino: Found best price! $189 at Amazon
[View Results]
```

**Tab Title Update**:
```
(3/6) Checking prices... → ✓ Results ready - Mino
```

**On Return**:
If user returns during execution, smooth continuation.
If user returns after completion, gentle celebration:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ✓ All done! I found the best price while you were away.         │
│                                                                     │
│   Best: $189 at Amazon                                              │
│                                                                     │
│   [ See full results ]                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part VII: High-Stakes Variant

For complex queries like insurance quotes, the experience adapts:

### Extended Input Phase

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   🔍 "compare home insurance quotes"                                │
│                                                                     │
│   To get accurate quotes, I'll need a few details:                 │
│                                                                     │
│   Property address: [ 123 Main St, Austin TX          ]            │
│   Home value:       [ $400,000                        ]            │
│   Year built:       [ 1985                            ]            │
│   Coverage amount:  [ $300,000           ] (recommended)           │
│                                                                     │
│   I'll check these insurers:                                       │
│   ✓ Geico  ✓ Progressive  ✓ State Farm  ✓ Allstate                │
│   ✓ Liberty Mutual  ✓ USAA                                        │
│                                                                     │
│   [ Get Quotes → ]                                                 │
│                                                                     │
│   This takes about 2 minutes for accurate quotes                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Extended Execution Phase

For longer operations, more detailed progress:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   Getting your insurance quotes...                                 │
│                                                                     │
│   ━━━━━━━━━━━━━━━━━━━━━○─────────────  4 of 6 insurers             │
│                                                                     │
│   Currently: Filling out Progressive quote form...                 │
│                                                                     │
│   ✓ Geico: $1,245/year                                             │
│   ✓ State Farm: $1,389/year                                        │
│   ✓ Allstate: $1,567/year                                          │
│   ◐ Progressive: Calculating...                                    │
│   ○ Liberty Mutual: Queued                                         │
│   ○ USAA: Queued                                                   │
│                                                                     │
│   🏆 Best so far: $1,245/year at Geico                             │
│                                                                     │
│   [ Stop and show results ]                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Rich Results

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   Home Insurance Quotes for 123 Main St, Austin TX                 │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  🏆 BEST VALUE                                               │  │
│   │                                                              │  │
│   │  Geico: $1,245/year ($104/month)                            │  │
│   │                                                              │  │
│   │  Coverage: $300,000 dwelling, $100,000 liability            │  │
│   │  Deductible: $1,000                                         │  │
│   │  Discounts applied: Multi-policy, Security system           │  │
│   │                                                              │  │
│   │  [ Get this quote → ]                                        │  │
│   │                                                              │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   All quotes:                                                       │
│   ┌─────────────┬──────────────┬─────────────┬──────────────────┐  │
│   │ Insurer     │ Annual Cost  │ Deductible  │ Coverage         │  │
│   ├─────────────┼──────────────┼─────────────┼──────────────────┤  │
│   │ Geico     ★ │ $1,245       │ $1,000      │ $300k / $100k    │  │
│   │ State Farm  │ $1,389       │ $1,000      │ $300k / $100k    │  │
│   │ Progressive │ $1,412       │ $1,000      │ $300k / $100k    │  │
│   │ Liberty     │ $1,489       │ $500        │ $300k / $100k    │  │
│   │ Allstate    │ $1,567       │ $1,000      │ $300k / $100k    │  │
│   │ USAA        │ $1,678       │ $1,000      │ $350k / $150k    │  │
│   └─────────────┴──────────────┴─────────────┴──────────────────┘  │
│                                                                     │
│   💡 Analysis:                                                      │
│   • Geico offers the best rate with standard coverage              │
│   • USAA costs more but includes higher coverage limits            │
│   • Liberty Mutual has a lower deductible ($500 vs $1,000)         │
│   • All quotes are valid for 30 days                               │
│                                                                     │
│   ⚠️ Note: Final rates may vary based on credit check and          │
│      additional underwriting.                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part VIII: Technical Implementation Notes

### API Changes Required

1. **New endpoint**: `POST /api/orchestrator/run` - spawns parallel sessions
2. **New endpoint**: `GET /api/orchestrator/{id}/stream` - SSE for live updates
3. **Enhanced response**: Include aggregation and synthesis in final output

### Frontend Components

1. **OrchestratorProvider** - Context for managing parallel sessions
2. **QueryEnricher** - Input enhancement with site selection
3. **ParallelProgress** - Visual orchestra view
4. **LiveAggregator** - Real-time results table
5. **SynthesisPanel** - AI-generated insights
6. **NextActions** - Post-result action buttons

### State Sync

Use Server-Sent Events (SSE) for real-time updates:
- Session status changes
- Result arrivals
- Synthesis updates
- Error notifications

---

## Part IX: Success Metrics

### Quantitative

- **Time to first result**: < 5 seconds
- **Total completion time**: 40% faster than sequential
- **User drop-off during wait**: < 10%
- **Action completion rate**: > 60% (user clicks "buy" or similar)

### Qualitative

- User understands capability on first visit
- User trusts results without needing to verify
- User returns for subsequent queries
- User recommends to others

---

## Part X: Implementation Phases

### Phase 1: Foundation
- Orchestrator hook with parallel session management
- Basic parallel progress visualization
- Simple aggregation (table only)

### Phase 2: Polish
- Live "best so far" updates
- Browser preview grid
- Synthesis and insights

### Phase 3: Delight
- Background operation with notifications
- Query history and saved searches
- Price drop alerts

---

## Appendix: Design Principles Checklist

Every feature should answer YES to:

- [ ] Does this respect the user's time?
- [ ] Does this build trust through transparency?
- [ ] Does this deliver an answer, not just data?
- [ ] Does this feel like delegation, not operation?
- [ ] Does this work whether user watches or not?
- [ ] Does this invite the next action naturally?
- [ ] Does this make the complex feel simple?

---

*"You ask. Mino goes. Answers come back."*

But now: **Mino goes everywhere at once.**
