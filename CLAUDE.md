# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mino is a multi-session parallel query search application built with Next.js. Users enter a search query (e.g., "Find the best price for AirPods Pro"), the app parses the intent, suggests relevant sites to search, then launches multiple browser automation sessions in parallel across those sites, aggregating and synthesizing the results.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

### Core Flow (The "Orchestra")

1. **Query Parsing** (`useOrchestrator.ts:261-309`) - Analyzes user query to detect intent (price_comparison, quote_request, availability_check, etc.) and suggests relevant sites
2. **Site Configuration** - User can toggle which sites to search from pre-configured catalogs per intent type
3. **Parallel Execution** - Spawns up to 6 concurrent browser sessions via TinyFish API, with 300ms stagger delay
4. **Result Extraction** - Parses structured data (prices, availability, shipping) from raw agent responses
5. **Synthesis** - Generates headline, summary, and insights comparing all results

### Key Components

- **`useOrchestrator` hook** (`src/hooks/useOrchestrator.ts`) - Central state machine managing the entire search lifecycle via useReducer. Handles query parsing, lane management, polling, result aggregation.
- **SessionLane** - Represents one browser session searching one site. States: queued → initializing → navigating → extracting → complete/error
- **QueryEnricher** (`src/components/ui/QueryEnricher.tsx`) - Input component with site selection chips
- **OrchestraProgress** (`src/components/ui/OrchestraProgress.tsx`) - Live progress visualization of all lanes
- **ResultsAggregator** (`src/components/ui/ResultsAggregator.tsx`) - Final synthesized results display

### External API

All browser automation runs through TinyFish API (`src/lib/api.ts`):
- `POST /api/playground/runs` - Start a new browser session
- `GET /api/sessions/{sessionId}` - Poll session status and results

Session events follow typed schema in `src/types/index.ts` (function_call, function_response, final_response).

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json)
