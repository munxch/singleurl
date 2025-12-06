'use client';

import { useState, useEffect, useCallback } from 'react';
import { QueryFeedback } from '@/types';

export function useQueryFeedback(query: string, enabled: boolean) {
  const [feedback, setFeedback] = useState<QueryFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!enabled || query.length < 10) {
      setFeedback(null);
      return;
    }

    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      setIsAnalyzing(false);

      // Simulate feedback based on query content
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('hotel') || lowerQuery.includes('find')) {
        setFeedback({
          willSucceed: true,
          extractionSummary: "I'll search for hotels matching your criteria and extract pricing information.",
          estimatedTimeSeconds: 15,
        });
      } else if (lowerQuery.includes('price') || lowerQuery.includes('cost')) {
        setFeedback({
          willSucceed: true,
          extractionSummary: "I'll navigate to the site and extract the pricing details.",
          estimatedTimeSeconds: 12,
        });
      } else if (query.length < 20) {
        setFeedback({
          willSucceed: false,
          advice: 'Try adding more specific details to your query for better results.',
          highlight: query,
          suggestedQuery: query + ' with reviews and ratings',
        });
      } else {
        setFeedback({
          willSucceed: true,
          extractionSummary: 'Query looks good! I\'ll extract the requested information.',
          estimatedTimeSeconds: 20,
        });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [query, enabled]);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  return { feedback, isAnalyzing, clearFeedback };
}
