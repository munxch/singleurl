'use client';

import { useState } from 'react';
import { SearchIcon, ShieldIcon, MapPinIcon, GlobeIcon, ZapIcon, XIcon, SparklesIcon } from '@/components/icons';
import { QueryIntent } from '@/types/orchestrator';

interface ExampleCardsProps {
  onSelectExample: (query: string) => void;
}

// Categories with their examples
interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  examples: string[];
}

const CATEGORIES: Category[] = [
  {
    id: 'shopping',
    label: 'Shopping',
    icon: SearchIcon,
    color: 'text-blue-400',
    examples: [
      "Find the best price for AirPods Pro 2nd generation",
      "Compare prices on a 65 inch Samsung OLED TV",
      "Best deals on MacBook Pro 14 inch M3 Pro",
      "Find the cheapest Nintendo Switch OLED bundle",
    ],
  },
  {
    id: 'insurance',
    label: 'Insurance',
    icon: ShieldIcon,
    color: 'text-purple-400',
    examples: [
      "Compare auto insurance for a 2023 Toyota RAV4 in California",
      "Get home insurance quotes for a $500k house in Texas",
      "Find the best renters insurance under $20/month",
      "Compare life insurance policies for $500k coverage",
    ],
  },
  {
    id: 'auto',
    label: 'Auto',
    icon: ZapIcon,
    color: 'text-orange-400',
    examples: [
      "Find a used Tesla Model Y Long Range under $40k",
      "Search certified pre-owned Honda CR-V within 50 miles",
      "Compare new Ford F-150 prices at dealers near me",
      "Find a 2021 or newer Jeep Wrangler 4-door",
    ],
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: GlobeIcon,
    color: 'text-sky-400',
    examples: [
      "Roundtrip flights from San Francisco to Tokyo in March",
      "Compare 4-star hotel prices in NYC for New Year's Eve",
      "Find the cheapest direct flights to London from LAX",
      "Week-long car rental in Maui for a family of 4",
    ],
  },
  {
    id: 'local',
    label: 'Local',
    icon: MapPinIcon,
    color: 'text-green-400',
    examples: [
      "Is the iPhone 16 Pro Max 256GB in stock near me?",
      "Find PS5 Slim availability at stores within 10 miles",
      "Check if Best Buy has the RTX 4080 in stock",
      "Where can I pick up AirPods Max today?",
    ],
  },
];

export function ExampleCards({ onSelectExample }: ExampleCardsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleExampleClick = (query: string) => {
    setExpandedCategory(null);
    onSelectExample(query);
  };

  const activeCategory = CATEGORIES.find(c => c.id === expandedCategory);

  return (
    <div className="relative min-h-[220px]">
      {/* Category pills - hidden when expanded */}
      {!activeCategory && (
        <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 justify-center animate-fadeIn">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200
                  bg-white/[0.03] text-white/60 border border-white/10
                  hover:bg-white/[0.06] hover:text-white/80
                "
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Expanded examples panel - replaces the pills */}
      {activeCategory && (
        <div className="absolute inset-x-0 top-0 glass-card p-4 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <activeCategory.icon className={`w-4 h-4 ${activeCategory.color}`} />
              <span className="text-white/70 text-sm font-medium">{activeCategory.label}</span>
            </div>
            <button
              onClick={() => setExpandedCategory(null)}
              className="p-1 rounded text-white/40 hover:text-white/60 transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Example list */}
          <div className="space-y-1">
            {activeCategory.examples.map((example, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(example)}
                className="
                  w-full text-left px-3 py-2.5 rounded-lg
                  text-white/80 text-sm
                  hover:bg-white/5 hover:text-white
                  transition-colors
                  border-b border-white/5 last:border-0
                "
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
