## The Challenge

Mino is a powerful tool. Powerful tools can feel intimidating.

The goal is to make people *want* to pick it up — and when they do, deliver something actionable. Not just data. A recommended path forward.

---

## Core Insight

Most browser agents run a single session, do research, and bring back data. The user is left to figure out what to do with it.

Mino runs multiple sessions in parallel, synthesizes what it finds, and returns **recommendations with rationale and next steps**.

| Today | Opportunity |
| --- | --- |
| "Here's 5 prices" | "Top recommendation: Target — in stock, 2 miles away, ready in 1 hour. Here's why." |
| "Here's 3 quotes" | "Top recommendation: Geico — lowest price, meets your coverage needs. Here's the breakdown." |
| Data delivered | Recommendation delivered with reasoning |

The shift: from **tool** to **trusted assistant**.

---

## Guiding Principles

**1. Make it inviting, not intimidating**
The first screen should make someone want to try it — not wonder if they can figure it out.

**2. Solve the blank screen**
People freeze when faced with an empty prompt. Solve this differently depending on task complexity.

**3. Recommendations with rationale, not commands**
Every result should lead with a top recommendation and *why* — not just raw information. Mino advises, it doesn't dictate. The user decides.

**4. Trust through transparency**
The magic shouldn't be a black box. Users can peek behind the curtain — see browser sessions spinning up, watch Mino navigate in real-time. This builds trust and demonstrates scale. Optional for those who want it, unobtrusive for those who don't.

**5. One system that flexes**
Simple tasks feel fast. Complex tasks feel thorough. Same interaction model, different execution.

**6. Turn failures into features**
When a site blocks us, don't hide it — escalate. Show resilience by going deeper. "Carvana blocked us. Going to dealerships directly."

---

## The Two Demo Flows

We're building two flows that demonstrate the range of what Mino can do:

| | Flow 1: Car Search | Flow 2: Date Night |
|---|---|---|
| **Type** | Complex, multi-site with escalation | Simple, fast, decisive |
| **Query** | "Find a used Honda Civic under $25k, under 50k miles, with Apple CarPlay" | "Date night tonight in Dallas, nice Italian, 7pm for 2" |
| **Sites** | 6 initial → escalates to 10 | 5 |
| **Time** | ~35 seconds | ~10 seconds |
| **Drama** | Carvana blocks → "Going deeper" → 4 more dealerships spawn | Speed is the drama |
| **Result** | Rich card with car photo, dealer info, rationale | Rich card with restaurant photo, vibe, reviews |
| **Action** | "Schedule Test Drive" | "Reserve Table" |

### Why These Examples

- **Car Search**: Shows parallelism at scale (10 sites), demonstrates resilience (escalation on block), has a real action (schedule test drive), personally resonant use case
- **Date Night**: Shows speed, demonstrates fast decision-making, has immediate action (reserve now), universally relatable

---

## Entry Experience — Landing Page

### Structure

```
┌─────────────────────────────────────────────────────────┐
│  MINO logo                                              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [ What can Mino help you find?              🔍] │   │
│  └─────────────────────────────────────────────────┘   │
│  ↑ Search input - sticky at top                        │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  🚗 Cars & Vehicles                            ▼       │
│     ├─ Search dealer inventory                          │
│     │  Template: Find a [year] [make] [model]...       │
│     │  Example: "Find a used Honda Civic under $25k"   │
│     └─ [Click to fill input]                            │
│                                                         │
│  🍝 Dining & Reservations                      ▼       │
│     ├─ Find date night spot                             │
│     │  Template: [cuisine] restaurant in [city]...     │
│     │  Example: "Date night tonight, nice Italian"     │
│     └─ [Click to fill input]                            │
│                                                         │
│  📍 Local & Availability                       ▼       │
│  🛒 Shopping & Prices                          ▼       │
│  ✈️ Travel & Booking                           ▼       │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

### Key Decisions

- **Search input at top** — Always visible, sticky on scroll
- **Category accordions below** — Adapted from RefinedJobsMenu (Concept 11)
- **Templates with [placeholders]** — Shows what to customize
- **Click fills input, doesn't auto-run** — Gives user control to edit before submitting
- **Hint appears after fill** — "Edit to customize, then press Enter"

---

## Flow 1: Car Search (Complex)

### The Query

> "Find a used Honda Civic under $25k, under 50k miles, with Apple CarPlay"

### Act 1 — Initial Spawn (6 sites)

Sites: CarGurus, Carvana, AutoTrader, Cars.com, CarMax, Facebook Marketplace

User sees a grid of 6 browser thumbnails spinning up simultaneously. The parallelism is immediately visible.

### Act 2 — The Block + Escalation

One lane (Carvana) hits a wall:

```
Lane: Carvana
  ⚠️ Blocked by Cloudflare
```

Beat. One second pause. Then:

```
┌─────────────────────────────────────────────────────────┐
│  Carvana blocked us.                                    │
│  Going deeper — finding Honda dealerships near 75201... │
└─────────────────────────────────────────────────────────┘
```

### Act 3 — Second Wave Spawn

4 more lanes appear:
- Honda of Dallas
- AutoNation Honda
- Park Place Honda
- Craigslist Dallas

Now there are **10 lanes** running. The scale becomes undeniable.

### Mock Data — Car Search Results

| Site | Result | Notes |
|------|--------|-------|
| CarGurus | 2022 Civic EX, $22,400, 38k mi | Good online option |
| Carvana | ⚠️ Blocked | Triggers escalation |
| AutoTrader | 2020 Civic, $19,800, 61k mi | Over mileage limit |
| Cars.com | 2022 Civic, $23,100, 41k mi | Solid option |
| CarMax | 2023 Civic, $26,500, 28k mi | Over budget |
| FB Marketplace | 2021 Civic, $21,000, 45k mi | No CarPlay confirmed |
| **Honda of Dallas** | **2022 Civic EX, $21,900, 35k mi** | **BEST MATCH — local dealer** |
| AutoNation Honda | 2021 Civic, $23,400, 44k mi | Available |
| Park Place Honda | No matching inventory | — |
| Craigslist Dallas | 2019 Civic, $17,500, 68k mi | Too many miles |

### Synthesis — Car Search

```
TOP RECOMMENDATION

2022 Honda Civic EX at Honda of Dallas — $21,900

Why this one:
• Lowest price meeting ALL your criteria
• 35k miles — well under your 50k limit
• Apple CarPlay confirmed
• Local dealer (8.2 mi) — test drive today
• Dealer rating: 4.6★ (892 reviews)

[ Schedule Test Drive ]    [ Call Dealer ]
```

### What We Checked — Transparency View

```
CHECKED 10 SOURCES

✓ CarGurus        2022 Civic $22,400         [View]
✓ Cars.com        2022 Civic $23,100         [View]
✓ AutoTrader      2020 Civic — over mileage
✓ CarMax          2023 Civic — over budget
✓ FB Marketplace  No CarPlay confirmed
⚠️ Carvana        Blocked — went to dealers instead
✓ Honda of Dallas ← BEST MATCH
✓ AutoNation      2021 Civic $23,400         [View]
✓ Park Place      No matching inventory
✓ Craigslist      Too many miles
```

---

## Flow 2: Date Night (Simple)

### The Query

> "Date night tonight in Dallas, nice Italian, 7pm for 2"

### Execution

5 sites spawn simultaneously: OpenTable, Resy, Yelp, Google, Tock

Fast execution: ~10-12 seconds. Speed is the drama here.

### Mock Data — Date Night Results

| Site | Result |
|------|--------|
| OpenTable | Carbone — 7:15pm available, $$$$ |
| **Resy** | **Lucia — 7:00pm available, $$$** |
| Yelp | North Italia — 7:30pm available, $$ |
| Google | Shows all three + ratings |
| Tock | No Italian restaurants on platform |

### Rich Result Card — Date Night

```
┌─────────────────────────────────────────────────────────┐
│  [Hero image: Lucia interior - moody, warm lighting]    │
│                                                         │
│  LUCIA                                  7:00pm tonight  │
│  ★★★★★ 4.7  •  $$$  •  Italian                         │
│                                                         │
│  "Best handmade pasta in Dallas. Intimate, romantic,   │
│   perfect for date night."                              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ WHY MINO PICKED THIS                            │   │
│  │ • Exact time you wanted (7pm)                   │   │
│  │ • Highest rated Italian in your area            │   │
│  │ • "Romantic ambiance" mentioned in 80+ reviews  │   │
│  │ • Reservations still available (going fast)     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📍 2332 Flora St, Dallas  •  12 min from you          │
│                                                         │
│  [ Reserve 7:00pm for 2 ]                              │
│                                                         │
└─────────────────────────────────────────────────────────┘

OTHER OPTIONS

┌─────────────────────────────────────────────────────────┐
│ [img] CARBONE           7:15pm   $$$$  ★4.8            │
│       "NYC-style Italian, celebrity scene"              │
│       → Fancier, but 15 min later          [Reserve]   │
├─────────────────────────────────────────────────────────┤
│ [img] NORTH ITALIA      7:30pm   $$    ★4.3            │
│       "Upscale casual, great for groups"                │
│       → More casual vibe, later slot       [Reserve]   │
└─────────────────────────────────────────────────────────┘
```

---

## Rich Results — The Pattern

Both flows follow the same result structure:

### Structure

```
┌─────────────────────────────────────────────────────────┐
│  [Hero image - restaurant interior / car photo]         │
│                                                         │
│  TITLE                                     KEY DETAIL   │
│  ★★★★★ rating  •  price  •  category                   │
│                                                         │
│  "Pull quote from reviews / key selling point"          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ WHY MINO PICKED THIS                            │   │
│  │ • Rationale 1 (tied to user's request)          │   │
│  │ • Rationale 2                                   │   │
│  │ • Rationale 3                                   │   │
│  │ • Rationale 4 (trust signal)                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📍 Location  •  Distance  •  Availability              │
│                                                         │
│  [ Primary Action Button ]    [ Secondary Action ]      │
│                                                         │
│  OTHER OPTIONS ▼                                        │
│  [Collapsed list with trade-off context]                │
└─────────────────────────────────────────────────────────┘
```

### Key Elements

1. **Hero image** — Visual that sells the vibe/product (not stock photos)
2. **Key facts** — Price, time, rating, distance at a glance
3. **Pull quote** — Social proof that's specific, not generic
4. **"Why Mino picked this"** — 3-4 bullets connecting directly to the user's request
5. **Trust signals** — Reviews, ratings, credentials
6. **Specific action** — "Schedule Test Drive at Honda of Dallas" not "Learn More"
7. **Alternatives with context** — Trade-offs explained ("fancier, but 15 min later")
8. **Transparency** — What was checked, including failures

---

## Waiting Experience

### Short Tasks (<15 seconds)

- **Date Night flow**
- User watches the progress
- 5 lanes complete quickly
- "Best so far" updates as results come in
- Speed IS the demo — no need to offer escape

### Long Tasks (>30 seconds)

- **Car Search flow**
- Same progress view, but after ~10 seconds:

```
┌─────────────────────────────────────────────────────────┐
│  Checking 10 sources... about 25 seconds left.          │
│                                                         │
│  [ Keep watching ]     [ Text me when ready ]           │
└─────────────────────────────────────────────────────────┘
```

- "Text me when ready" opens a phone number input
- User can close tab, get a text when done: "Your car search is ready → [link]"
- **For demo:** Show the affordance, but default path is "Keep watching"

---

## Parallel Spawn Visual

### Current State
Progress bars in a list. Functional but doesn't convey scale.

### Target State
Grid of browser thumbnails that appear simultaneously:

```
┌─────────────────────────────────────────────────────────┐
│  Checking 10 sources for your Honda Civic...            │
│                                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ CG  │ │ CV  │ │ AT  │ │Cars │ │ CM  │ │ FB  │       │
│  │ ✓   │ │ ⚠️  │ │ ... │ │ ... │ │ ... │ │ ... │       │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘       │
│                                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │
│  │Honda│ │Auto │ │Park │ │ CL  │  ← Second wave        │
│  │ ... │ │ ... │ │ ... │ │ ... │                       │
│  └─────┘ └─────┘ └─────┘ └─────┘                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🏆 Best so far: $21,900 at Honda of Dallas      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Key Visual Moments

1. **Initial spawn** — 6 thumbnails appear at once (the "whoa")
2. **Escalation** — Carvana shows ⚠️, pause, message appears, 4 more thumbnails spawn
3. **Live updates** — Checkmarks appear as lanes complete
4. **Best so far** — Trophy card updates as better results come in

---

## Handling Failures

### Philosophy
Don't hide failures. Turn them into demonstrations of resilience.

### The Escalation Pattern

When a site blocks:
1. Show the block clearly: "⚠️ Blocked by Cloudflare"
2. Pause for 1 second (let it register)
3. Show the pivot: "Carvana blocked us. Going deeper..."
4. Spawn additional sources
5. In final results, show transparency: "Carvana blocked — went to dealers instead"

### When Nothing Works

If multiple critical sites fail:
```
┌─────────────────────────────────────────────────────────┐
│  We hit some walls.                                     │
│                                                         │
│  ✓ Found results from 4 of 10 sources                  │
│  ⚠️ 3 sites blocked (Carvana, CarMax, AutoTrader)      │
│  ✗ 3 sites had no matching inventory                   │
│                                                         │
│  Here's what we found:                                  │
│  [Show results from successful sources]                 │
│                                                         │
│  Want to try different criteria?                        │
│  [ Adjust Search ]                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Transparency — Peek Behind the Curtain

The magic shouldn't be a black box. Users can *choose* how much they see.

| Layer | What They See | Why It Matters |
| --- | --- | --- |
| **Surface** | "Checking 10 sites..." (calm progress) | Enough to know it's working |
| **Peek** | Grid of browser thumbnails with status | Shows scale and parallel power |
| **Detail** | Expandable lane with browser preview | Power users can watch navigation |

**How it works:**

- Default: Grid view showing all lanes at surface level
- Optional: Click any lane to expand and see browser preview
- Power users can watch; casual users see enough to trust

---

## Signup — Earning the Conversion

**Philosophy:** Don't gate the magic. Let them experience value first.

Signup happens when there's a natural reason — not as a barrier to entry.

### Signup Triggers

| Moment | Trigger | Why It's Natural |
| --- | --- | --- |
| **Save results** | "Want to save this comparison?" | They got value, now they want to keep it |
| **Long task** | "Text me when ready" | Feature requires contact info |
| **Watch/recurring** | "Alert me when prices drop" | The feature requires contact info |
| **Branching action** | "Schedule Test Drive" | Next step may need identity |

**For demo:** Signup flow is out of scope. Focus on the core experience.

---

## Implementation Checklist

### Phase 1: Mock Data
- [ ] Define exact mock results for Car Search (10 sites)
- [ ] Define exact mock results for Date Night (5 sites)
- [ ] Write synthesis copy for both flows
- [ ] Source hero images (restaurant interior, car listing photo)

### Phase 2: Escalation Moment
- [ ] Implement Carvana block detection in mock
- [ ] Add "Going deeper..." message with timing
- [ ] Spawn second wave of lanes (4 dealerships)
- [ ] Update lane count and progress accordingly

### Phase 3: Parallel Spawn Visual
- [ ] Replace progress bar list with thumbnail grid
- [ ] Show lanes spawning simultaneously
- [ ] Add visual distinction for second wave
- [ ] Implement "Best so far" live updates

### Phase 4: Rich Results
- [ ] Build hero image component
- [ ] Build "Why Mino picked this" rationale box
- [ ] Implement specific action buttons
- [ ] Build "Other options" with trade-off context
- [ ] Build "What we checked" transparency view

### Phase 5: Entry & Wait Experience
- [ ] Update landing page: search input top, categories below
- [ ] Adapt RefinedJobsMenu for hero examples (Car + Date Night)
- [ ] Add "Text me when ready" affordance (UI only for demo)

### Phase 6: Polish
- [ ] Finalize all copy (headlines, rationale, buttons)
- [ ] Tune timing (escalation pause, lane stagger)
- [ ] Test full flow end-to-end

---

## Flow Overview

| Step | Car Search (Complex) | Date Night (Simple) |
| --- | --- | --- |
| **Land** | Search input + category templates | Same |
| **Input** | Click template or type query | Same |
| **Preview** | "I'll check these 10 sources" | "I'll check these 5 sources" |
| **Spawn** | 6 lanes → Carvana blocks → 4 more spawn | 5 lanes, all at once |
| **Wait** | ~35 sec, option to get texted | ~10 sec, just watch |
| **Progress** | Grid of thumbnails, "best so far" updates | Same, faster |
| **Results** | Rich card: photo, rationale, "Schedule Test Drive" | Rich card: photo, vibe, "Reserve Table" |
| **Transparency** | "Checked 10 sources" with status per site | "Checked 5 sources" |

---

## What This Proves

1. **The system is inviting** — Templates solve blank screen anxiety
2. **The system is resilient** — Blocks become escalation, not failure
3. **The parallelism is visible** — Scale is the hero, not hidden
4. **The output is trustworthy** — Rich results with rationale, not just data
5. **The action is specific** — "Schedule Test Drive" not "Learn More"
6. **The system flexes** — 10-second fast vs 35-second thorough

---

## Open Questions (Resolved)

- ~~What existing UI patterns or visual language should this align with?~~ → Adapted RefinedJobsMenu (Concept 11)
- ~~Are there other task types that would better demonstrate the range?~~ → Car Search + Date Night
- ~~How should we handle cases where Mino can't complete the task?~~ → Escalation pattern + graceful degradation

---

## Post-Results Experience

The results page shouldn't be a dead end. Three key additions ensure users always have a path forward:

### 1. Pivot Suggestions — "Not What You're Looking For?"

When the main results don't satisfy, offer intelligent pivots based on the original query:

**Date Night:**
| Pivot | Query |
|-------|-------|
| Japanese at 7pm | Different cuisine, same time |
| Steakhouse at 7pm | Different cuisine, same time |
| Wine bar nearby | Different vibe, same area |

**Car Search:**
| Pivot | Description |
|-------|-------------|
| Raise budget to $30k | "12 more options available" |
| Expand to 50 miles | "8 more dealers in range" |
| Try Honda Accord | "Similar features, more space" |
| Drop Apple CarPlay | "6 more options under budget" |

### 2. Recurring Workflow Setup

Turn one-off searches into automated, recurring tasks:

**Date Night:**
> "Make this a weekly thing?"
> Every Friday at 5pm, Mino finds date night options for tonight

**Car Search:**
> "Watch for new listings?"
> Get alerted when new Civics under $25k hit the market
> "Usually finds 2-3 new listings per week"

This is a natural signup moment — the feature requires contact info.

### 3. Bottom Actions — "Not What You Need?"

Always provide escape routes:
- **Modify Search** — Adjust criteria without starting over
- **Start Over** — Fresh search
- **Tell us what went wrong** — Feedback loop (optional)

---

## Assets Needed

### Images
- Restaurant interior photo (Lucia or similar upscale Italian)
- Second restaurant photo (Carbone or similar)
- Third restaurant photo (North Italia or similar casual)
- Car listing photo (2022 Honda Civic EX)
- Alternate car photos for other options

### Copy
- Synthesis headlines for both flows
- "Why Mino picked this" bullets (4 per result)
- Review pull quotes
- Action button text
- Escalation message copy
- Error/block state copy
- Pivot suggestion labels
- Recurring workflow descriptions
