# Demo Repo

Mino is a multi-session parallel search application built with Next.js. Users enter a search query, and the app launches multiple browser automation sessions in parallel across relevant sites, aggregating and synthesizing the results into a unified answer.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Pages Overview

### `/` - Home
The main landing page with a search input and quick-start examples. Users can enter natural language queries like "Find a 2024 Lexus GX in Dallas" or select from featured examples to see Mino in action.

### `/explore` - Explore Examples
A gallery of example queries organized by category (Sales & Research, Shopping, Local, etc.). Browse different use cases to understand what Mino can do.

### `/explore/flow` - Voice Flow Demo
An interactive voice-first interface featuring an animated audio orb. Tap to activate, speak your query, and watch Mino process it in real-time. Includes a demo of the CFO search workflow.

### Demo Pages

These pages showcase polished, scripted demonstrations of specific search workflows:

#### `/demo/date-night-cascade`
Restaurant reservation search demo. Shows Mino searching OpenTable, Resy, Yelp, and Google Maps to find Italian restaurants in Dallas for a date night, with availability checking and booking options.

#### `/demo/car-search-cascade`
Vehicle inventory search demo. Shows Mino searching multiple dealership sites to find a specific car (2024 Lexus GX Overtrail), comparing prices, mileage, and features across dealers.

#### `/demo/cfo-search-cascade`
B2B lead generation demo. Shows Mino searching LinkedIn, Apollo, ZoomInfo, and company websites to find CFOs at hospitality companies, with contact info verification and data enrichment.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS 4
- **3D Graphics**: Three.js (for the audio orb visualization)
- **Language**: TypeScript

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── demo/              # Scripted demo experiences
│   ├── explore/           # Example gallery & voice flow
│   └── page.tsx           # Home page
├── components/
│   ├── demo/              # Demo-specific components
│   ├── icons/             # SVG icon components
│   └── ui/                # Reusable UI components
├── hooks/                 # React hooks (useOrchestrator, etc.)
├── lib/                   # Utilities, API client, mock data
└── types/                 # TypeScript type definitions
```
