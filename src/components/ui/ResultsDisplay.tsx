'use client';

import { useEffect, useState } from 'react';
import { SessionOutput } from '@/types';

interface ResultsDisplayProps {
  output: SessionOutput | null;
  query: string;
  onTryAnother: () => void;
}

// Simple markdown-like parser for the output
function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const processLine = (line: string, index: number) => {
    // Table detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      // Skip separator lines
      if (!line.includes('---')) {
        const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
        tableRows.push(cells);
      }
      return null;
    } else if (inTable) {
      // End of table
      inTable = false;
      const tableElement = (
        <div key={`table-${index}`} className="overflow-x-auto my-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                {tableRows[0]?.map((cell, i) => (
                  <th key={i} className="px-3 py-2 text-left text-white/70 font-medium">
                    {cell.replace(/\*\*/g, '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-white/10 hover:bg-white/5">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 text-white/90">
                      {cell.replace(/\*\*/g, '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      elements.push(tableElement);
    }

    if (inTable) return null;

    // Bold text with **
    const parseBold = (text: string) => {
      const parts = text.split(/\*\*([^*]+)\*\*/g);
      return parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
      );
    };

    // Headers
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-xl font-bold text-white mt-4 mb-2">{parseBold(line.slice(2))}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-lg font-semibold text-white mt-3 mb-2">{parseBold(line.slice(3))}</h2>;
    }

    // List items
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const content = line.trim().slice(2);
      const indent = line.match(/^\s*/)?.[0].length || 0;
      return (
        <div key={index} className="flex gap-2 my-1" style={{ paddingLeft: indent * 4 }}>
          <span className="text-blue-400">•</span>
          <span className="text-white/90">{parseBold(content)}</span>
        </div>
      );
    }

    // Italic note (starts with *)
    if (line.trim().startsWith('*') && line.trim().endsWith('*') && !line.includes('**')) {
      return (
        <p key={index} className="text-white/60 text-sm italic mt-4">
          {line.trim().slice(1, -1)}
        </p>
      );
    }

    // Empty line
    if (!line.trim()) {
      return <div key={index} className="h-2" />;
    }

    // Regular paragraph
    return <p key={index} className="text-white/90 my-1">{parseBold(line)}</p>;
  };

  lines.forEach((line, index) => {
    const element = processLine(line, index);
    if (element) {
      elements.push(element);
    }
  });

  // Handle any remaining table
  if (inTable && tableRows.length > 0) {
    elements.push(
      <div key="final-table" className="overflow-x-auto my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20">
              {tableRows[0]?.map((cell, i) => (
                <th key={i} className="px-3 py-2 text-left text-white/70 font-medium">
                  {cell.replace(/\*\*/g, '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-white/10 hover:bg-white/5">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 text-white/90">
                    {cell.replace(/\*\*/g, '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return elements;
}

// Extract the "headline" answer from the output
function extractHeadline(raw: string): string | null {
  const lines = raw.split('\n').filter(l => l.trim());
  if (lines.length === 0) return null;

  // Look for the first substantive line
  const firstLine = lines[0];

  // If it starts with common answer patterns, use it
  if (
    firstLine.includes('$') ||
    firstLine.toLowerCase().includes('best') ||
    firstLine.toLowerCase().includes('price') ||
    firstLine.toLowerCase().includes('cost') ||
    firstLine.toLowerCase().includes('found')
  ) {
    return firstLine;
  }

  return firstLine;
}

export function ResultsDisplay({ output, query, onTryAnother }: ResultsDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (output) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [output]);

  if (!output || !output.raw) {
    return null;
  }

  const headline = extractHeadline(output.raw);
  const content = parseMarkdown(output.raw);

  return (
    <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span className="font-medium">Done</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Here&apos;s what I found
        </h2>

        <p className="text-white/60 text-sm">
          For: &ldquo;{query}&rdquo;
        </p>
      </div>

      {/* Results Card */}
      <div className="glass-panel p-6">
        {/* Headline Answer */}
        {headline && (
          <div className="mb-4 pb-4 border-b border-white/10">
            <div className="text-lg text-white font-medium">
              {headline}
            </div>
          </div>
        )}

        {/* Full Content */}
        <div className="prose prose-invert max-w-none">
          {content}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={onTryAnother}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Ask something else
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(output.raw);
          }}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
        >
          Copy results
        </button>
      </div>
    </div>
  );
}
