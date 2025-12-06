# Mino First-Touch Experience — Strategic Vision

---

## The Core Reframe

**From:** "A tool that automates browsers"
**To:** "A capable assistant you delegate to"

Users don't want to *watch* automation. They want to *hand something off* and get back *answers they can act on*.

The experience should feel like:
> "I told someone smart to go figure this out. They came back with what I needed."

---

## The Emotional Arc

| Stage | User Feels | Design Goal |
|-------|------------|-------------|
| **Arrive** | Curious but skeptical | Remove intimidation instantly |
| **Input** | "This is easy" | Minimal friction, maximum clarity |
| **Handoff** | "Okay, go do your thing" | Confidence in delegation |
| **Wait** | "It's working for me" | Trust without attention |
| **Result** | "This is actually useful" | Clear value, actionable output |
| **After** | "I want to do this again" | Path forward is obvious |

---

## Experience Principles

### 1. Delegation, Not Operation

The user is not "using a tool." They're delegating a task.

- Language matters: "Find me..." not "Search for..."
- The system acts on their behalf, not under their command
- Results are delivered *to* them, not extracted *by* them

### 2. Confidence Before Commitment

Before they click "Run," they should feel certain about:
- What Mino is about to do
- Where it's going to look
- What they'll get back

**The generated preview is the trust moment.** It says: "Here's the plan. Does this look right?"

### 3. Presence Without Attention

During execution, the user shouldn't need to watch. But they should feel like something real is happening.

- Brief "magic moment" — see the agents spin up
- Then: calm, confident progress state
- Optional: leave and come back (notification model)

The system is *present* (working for you) without demanding *attention* (watching it work).

### 4. Answers, Not Data

Results should be *actionable*, not just informational.

**Bad:** "Here are 6 prices from 6 sites."
**Good:** "Best price is $189 at Amazon. $12 cheaper than the next option. In stock, arrives Friday."

The user came with a question. The result should answer it, not just provide raw material.

### 5. Range Without Complexity

The same interface handles both "quick check" and "serious research."

The system flexes based on:
- What the user asks for
- How much context they provide
- The complexity of the task

**The user doesn't choose a mode. The experience adapts.**

---

## The Flow — Moment by Moment

### Moment 1: Arrival

**What they see:**
- Clean, focused landing
- Clear value prop (one line)
- Single input area — not empty, not overwhelming

**What they feel:**
- "I understand what this is"
- "I know what to do"
- "This doesn't look hard"

**Design notes:**
- No feature lists, no "how it works" diagrams
- The input *is* the explanation
- Placeholder text does heavy lifting: "What do you want to find out?"

---

### Moment 2: Input & Enrichment

**What happens:**
- User types their goal (natural language)
- Mino interprets and enriches:
  - Suggests sites to check
  - Shows what output will look like
  - May ask one clarifying question (for complex tasks)

**What they feel:**
- "It understood me"
- "It's already thinking ahead"
- "I can see what I'm going to get"

**Design notes:**
- This is the "generated prompt" moment
- Show their words reflected back, elevated
- Site suggestions feel helpful, not presumptuous: "I'd check these — want to add any?"
- Output preview is specific: "You'll get: Product, Price, Availability, Shipping"

**Low stakes version:**
- Minimal enrichment
- Auto-selected sites
- "Ready to go" energy

**High stakes version:**
- One clarifying question: "Any specific coverage needs?" / "What's your budget range?"
- User can approve/edit sites
- More detailed output preview

---

### Moment 3: The Handoff

**What they see:**
- Clear "Run" / "Go" / "Find this" button
- Everything they need to feel confident is visible

**What they feel:**
- "I know exactly what's about to happen"
- "I trust this enough to try it"

**Design notes:**
- The button is the commitment. Make it feel like a handoff, not a gamble.
- Consider language: "Go find this" / "Get me answers" / "Run"
- Everything above the button should answer: "What, where, and what will I get?"

---

### Moment 4: Execution — The Magic Glimpse

**What they see (first 2-3 seconds):**
- Visual indication that agents are spinning up
- Brief "wow" moment — parallel execution is visible

**What they see (after):**
- Transition to calm progress state
- "Mino is working... checking 4 sites"
- Optional: light narration ("Reading pricing page on Amazon...")

**What they feel:**
- "Whoa, that's real"
- "It's actually doing something"
- Then: "Okay, I can relax — it's handled"

**Design notes:**
- The "browsers spinning up" visual is trust-building, not entertainment
- Don't make them watch the whole thing
- Progress should feel *calm*, not *anxious*
- Consider: "This usually takes about 30 seconds" (set expectations)

---

### Moment 5: The Wait (For Longer Tasks)

**What happens:**
- For quick tasks: this is barely noticeable
- For complex tasks: meaningful time passes

**What they can do:**
- Watch if they want (optional visibility)
- Tab away, get notified when done
- Light progressive profiling: "While Mino works — what team are you on?"

**What they feel:**
- "My time is respected"
- "I'm not stuck watching a loading bar"

**Design notes:**
- The wait is an opportunity, not a problem
- Narration builds trust: "Now comparing prices... Extracting shipping info..."
- Never make them feel like they *have to* watch

---

### Moment 6: Results — The Payoff

**What they see:**
- Structured, scannable output
- Clear answer to their question (not just data)
- Supporting details available but not overwhelming

**What they feel:**
- "This is actually useful"
- "I didn't have to do any of that work"
- "I want to do this again"

**Design notes:**

**For low stakes:**
- Lead with the answer: "Best price: $189 at Amazon"
- Comparison table below (optional drill-down)
- Clear CTA: "Check another" / "Save this"

**For high stakes:**
- Lead with summary: "3 quotes found. Lowest: $120/mo from Geico"
- Show methodology: "Checked 5 sites, 2 required more info"
- Detailed breakdown available
- Clear next steps: "Review details" / "Get full quotes" / "Save comparison"

**Both should:**
- Answer the question, not just show data
- Make the next action obvious
- Feel like a *conclusion*, not a *handoff*

---

## The Two Example Tasks

### Example A: Low Stakes

**Input:** "What's the best price for AirPods Pro right now?"

**Enrichment:**
- Sites: Amazon, Best Buy, Apple, Walmart, Target
- Output preview: "Product, Price, Availability, Shipping"

**Result:**
> **Best price: $189 at Amazon**
> In stock. Arrives Friday with Prime.
>
> | Site | Price | Availability | Shipping |
> |------|-------|--------------|----------|
> | Amazon | $189 | In stock | Friday |
> | Best Buy | $199 | In stock | Saturday |
> | Apple | $249 | In stock | Monday |
> | Walmart | $194 | Low stock | Next week |
> | Target | $199 | In stock | Sunday |

---

### Example B: High Stakes

**Input:** "Compare home insurance quotes for a 3-bedroom house in Austin"

**Enrichment:**
- Clarifying question: "Any specific coverage priorities? (e.g., flood, high deductible, specific providers)"
- Sites: Geico, Progressive, State Farm, Allstate, Liberty Mutual
- Output preview: "Provider, Monthly Premium, Coverage Level, Deductible, Notable Exclusions"

**Result:**
> **3 complete quotes retrieved. Lowest: $120/mo from Geico.**
>
> Checked 5 providers. 2 required additional info (marked below).
>
> | Provider | Premium | Coverage | Deductible | Notes |
> |----------|---------|----------|------------|-------|
> | Geico | $120/mo | $300k | $1,000 | No flood |
> | Progressive | $135/mo | $300k | $1,500 | Includes flood |
> | State Farm | $142/mo | $350k | $1,000 | Bundle discount available |
> | Allstate | Needs info | — | — | Requires call to complete |
> | Liberty Mutual | Needs info | — | — | Requires property details |
>
> **Next steps:** Review full details / Request call from Allstate / Save comparison

---

## Visual & Interaction Notes

### Tone
- Clean, not minimal
- Confident, not flashy
- Helpful, not clever

### Language
- First person from Mino: "I'll check..." / "I found..."
- Action-oriented: "Find this" not "Submit"
- Plain language, no jargon

### Motion
- Purposeful transitions (convey progress, not decoration)
- Agents "spinning up" should feel energetic but brief
- Results should feel like they *arrive*, not just *appear*

### Hierarchy
- The question/goal is always visible
- The answer is the loudest thing on the results screen
- Details are available but not forced

---

## What This Vision Proves

1. **You understand the mental model shift** — delegation, not operation
2. **You've designed the emotional arc** — not just screens, but feelings
3. **You've thought about time** — the wait is designed, not ignored
4. **You've differentiated the contexts** — same system, different feels
5. **You've prioritized outcomes** — answers, not data

---

## One Line to Anchor Everything

> **"You ask. Mino goes. Answers come back."**

That's the experience. Everything else is detail.