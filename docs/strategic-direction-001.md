# TinyFish Mino Prototype — Strategic Breakdown

---

## Core Objective

**Make the powerful feel inviting.**

This is not a conversion funnel exercise. The goal is to demonstrate the moment where someone *gets it* — where a powerful, potentially intimidating tool becomes something they want to use.

---

## The Two Directions

Show the product's range by demonstrating the same system handling two different task types.

### Direction A: Low Stakes — "Quick Answer"

| Attribute | Detail |
|-----------|--------|
| **Example task** | "What's the best price for AirPods Pro right now?" |
| **User mindset** | Curious, casual, low commitment |
| **Input required** | Minimal — just the question |
| **Site selection** | Mino picks automatically |
| **Precision need** | Directional is good enough |
| **Speed expectation** | Fast — seconds, not minutes |
| **Output** | Quick comparison, best option highlighted, scannable |
| **Tone** | "Let me check that for you" |

### Direction B: High Stakes — "Do the Research"

| Attribute | Detail |
|-----------|--------|
| **Example task** | "Compare home insurance quotes for my situation" |
| **User mindset** | Serious, needs to trust the process |
| **Input required** | Guided capture — details, constraints, preferences |
| **Site selection** | User approves or adds their own |
| **Precision need** | High — this matters |
| **Speed expectation** | Willing to wait for thoroughness |
| **Output** | Detailed comparison, methodology visible, next steps clear |
| **Tone** | "I've done the legwork — here's what I found" |

### Why Both Matter

Showing both demonstrates:
- The system is flexible, not one-trick
- You understand different user contexts require different UX
- Product thinking, not just UI design

---

## Prototype Structure

**One flow, two examples.**

The underlying interaction model is the same — but the *feel* adapts based on task complexity.

| Step | Low Stakes | High Stakes |
|------|------------|-------------|
| **1. Land** | Shared — value prop + input | Shared — value prop + input |
| **2. Capture** | Light — Mino infers context | Guided — ask clarifying questions |
| **3. Generate** | Auto-selected sites, simple preview | User-approved sites, detailed preview |
| **4. Run** | Quick "working" state | Progress narration, visibility into process |
| **5. Wait** | Minimal — fast execution | Educational — explain what's happening |
| **6. Results** | Scannable, best option highlighted | Detailed, methodology shown, next steps |

---

## Key Points Mario Emphasized

From the transcript, these are the things Mario seemed most interested in or returned to:

### 1. The Wii Remote Metaphor
> The first experience should make people *want* to pick it up.

**Implication:** Don't lead with complexity. The first interaction should feel obvious, inviting, frictionless.

### 2. Blank Prompt Paralysis
> People sit down and don't know what to ask.

**Implication:** Don't present an empty text box. Guide, suggest, or constrain the first interaction.

### 3. Trust & Understanding
> Users see browsers moving but don't fully understand what's happening.

**Implication:** Some visibility into the process builds trust. Not "watch every step" but "understand enough to believe it."

### 4. Waiting Time is Real
> Complex tasks can take time (e.g., 50+ steps for insurance quotes).

**Implication:** Design the wait. Make it educational, or let users leave and return. Don't waste their attention.

### 5. Edge Cases — What Happens When It Fails?
> Mario specifically asked about handling things Mino can't do.

**Implication:** Acknowledge graceful degradation. Even if you don't prototype it, call it out in your rationale.

### 6. Scale Has Multiple Meanings
> High volume single transaction, wide problem coverage, many users with lighter usage.

**Implication:** The design should hint at scalability — this isn't just for one-off tasks.

### 7. Outcome Over Process
> Joshua's insight: "I don't want to watch the browser. Come back when you're ready with decisions, not just research."

**Implication:** Results should be *actionable*, not just data dumps. What do I do with this?

### 8. Consumer Focus is Valid
> Mario confirmed: thinking about how an end user benefits is a worthwhile approach.

**Implication:** You don't need to solve for enterprise. Consumer first-touch is the right scope.

---

## Design Principles (Wii Remote Framework)

| Principle | How It Shows Up |
|-----------|-----------------|
| **"Want to pick it up"** | Landing is inviting, not intimidating. One clear action. |
| **"Start from the rod"** | Simplest version first. Complexity is progressive. |
| **"Everything solves at once"** | The flow structure should resolve multiple frictions simultaneously. |
| **"It just worked"** | Zero ambiguity at each step. Button → result. |
| **"Remote, not controller"** | Familiar mental model: delegation, assistant, "handle this for me." |

---

## Key Tensions to Navigate

### 1. Personalization vs. Friction
- More context = more relevant result
- More context = more friction before magic
- **Resolution:** Gather minimum viable context, let the result sell the value

### 2. Visibility vs. Speed
- Watching browsers is part of the "wow"
- But users don't want to sit and watch
- **Resolution:** Brief visibility moment (trust-building), then calm "working" state

### 3. Flexibility vs. Focus
- The system can do a lot
- But showing everything creates confusion
- **Resolution:** Constrain to two clear examples that show range

### 4. Guidance vs. Autonomy
- Too much guidance feels patronizing
- Too much autonomy creates blank prompt paralysis
- **Resolution:** Suggest, don't dictate. "Here's what I'd check — want to add anything?"

---

## What the Prototype Should Prove

1. **You understand the core problem** — making powerful tools feel accessible
2. **You can design for different contexts** — low stakes vs. high stakes
3. **You think in systems** — one flexible flow, not two separate products
4. **You sweat the details** — waiting states, trust-building, result clarity
5. **You connect decisions to principles** — Wii Remote themes are visible in the work

---

## Edge Cases to Acknowledge (Not Prototype)

In your rationale, mention these as "next steps" or "considerations":

- **Mino can't complete the task** — How do we fail gracefully? Partial results? Human handoff?
- **User's goal is ambiguous** — How does Mino clarify without frustrating?
- **Sites require authentication** — How do we handle login flows?
- **Results are unexpected** — How do we build trust when the answer is surprising?

---

## Deliverables

1. **Functional Prototype**
   - Next.js app
   - One flow, demonstrated with two example tasks (low stakes / high stakes)
   - Clean but not over-designed (shadcn/ui, Tailwind)

2. **Written Rationale (1 page max)**
   - What problem you're solving
   - How the design connects to Wii Remote principles
   - Key decisions and why
   - What you'd explore next

---

## Time Allocation

| Task | Hours |
|------|-------|
| Final planning, review Mario's repo | 0.5 |
| Build flow structure (screens 1-6) | 2.5 |
| Implement both example tasks | 1.0 |
| Polish, edge cases, transitions | 0.5 |
| Write rationale | 0.5 |
| **Total** | **5 hours** |

---

## Questions for Mario (Sunday)

1. Confirm scope: "Consumer first-touch, landing through first result — does that feel right?"
2. Visual language: Any brand guidelines or existing UI to align with?
3. Output structure: What does actual Mino output look like? (JSON schema, etc.)
4. The sandbox repo: Anything specific you want me to build on or reference?

---

## Success Criteria

The work should make Mario think:

- "He gets the problem."
- "He can design for different contexts."
- "He thinks like a product person, not just a UI designer."
- "He connects his decisions to principles."
- "I want to see what else he'd do with this."