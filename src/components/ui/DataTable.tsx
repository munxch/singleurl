'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  MailIcon,
  LinkedInIcon,
  PhoneIcon,
  ExternalLinkIcon,
  CopyIcon,
} from '@/components/icons';

// =============================================================================
// TYPES
// =============================================================================

export interface DataTableColumn<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedRowId?: string | null;
  emptyMessage?: string;
  maxHeight?: string;
  showRowNumbers?: boolean;
  stickyHeader?: boolean;
}

// =============================================================================
// CONFIDENCE BADGE
// =============================================================================

export function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-white/10 text-white/50 border-white/20',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${styles[level]}`}>
      {level}
    </span>
  );
}

// =============================================================================
// CONTACT INDICATORS
// =============================================================================

export function ContactIndicators({
  email,
  emailVerified,
  linkedIn,
  phone,
}: {
  email?: string;
  emailVerified?: boolean;
  linkedIn?: string;
  phone?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Email */}
      <div className="relative group">
        {email ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(email);
            }}
            className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${
              emailVerified
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
            }`}
            title={emailVerified ? `Verified: ${email}` : `Unverified: ${email}`}
          >
            <MailIcon className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center justify-center w-6 h-6 rounded bg-white/5 text-white/30">
            <MailIcon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* LinkedIn */}
      <div className="relative group">
        {linkedIn ? (
          <a
            href={`https://${linkedIn}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-6 h-6 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            title={linkedIn}
          >
            <LinkedInIcon className="w-3.5 h-3.5" />
          </a>
        ) : (
          <div className="flex items-center justify-center w-6 h-6 rounded bg-white/5 text-white/30">
            <LinkedInIcon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Phone */}
      <div className="relative group">
        {phone ? (
          <a
            href={`tel:${phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-6 h-6 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
            title={phone}
          >
            <PhoneIcon className="w-3.5 h-3.5" />
          </a>
        ) : (
          <div className="flex items-center justify-center w-6 h-6 rounded bg-white/5 text-white/30">
            <PhoneIcon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// COMPANY TYPE BADGE
// =============================================================================

export function CompanyTypeBadge({ type }: { type: string }) {
  const typeConfig: Record<string, { emoji: string; label: string; color: string }> = {
    hotel: { emoji: '🏨', label: 'Hotel', color: 'bg-blue-500/20 text-blue-400' },
    restaurant_group: { emoji: '🍽️', label: 'Restaurant', color: 'bg-amber-500/20 text-amber-400' },
    event_venue: { emoji: '🎪', label: 'Events', color: 'bg-purple-500/20 text-purple-400' },
    catering: { emoji: '🍴', label: 'Catering', color: 'bg-rose-500/20 text-rose-400' },
    resort: { emoji: '🏖️', label: 'Resort', color: 'bg-cyan-500/20 text-cyan-400' },
  };

  const config = typeConfig[type] || { emoji: '🏢', label: type, color: 'bg-white/10 text-white/60' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${config.color}`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}

// =============================================================================
// DATA TABLE COMPONENT
// =============================================================================

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  selectedRowId,
  emptyMessage = 'No data available',
  maxHeight = '500px',
  showRowNumbers = true,
  stickyHeader = true,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortConfig.key];
      const bValue = (b as Record<string, unknown>)[sortConfig.key];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-white/40">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className="overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      style={{ maxHeight }}
    >
      <table className="w-full border-collapse">
        <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
          <tr className="bg-[#0a1628]/95 backdrop-blur-sm border-b border-white/10">
            {showRowNumbers && (
              <th className="px-3 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider w-12">
                #
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-3 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:text-white/60 select-none' : ''
                }`}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && sortConfig?.key === column.key && (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUpIcon className="w-3 h-3" />
                    ) : (
                      <ChevronDownIcon className="w-3 h-3" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedData.map((row, index) => {
            const rowId = keyExtractor(row);
            const isSelected = selectedRowId === rowId;

            return (
              <tr
                key={rowId}
                onClick={() => onRowClick?.(row)}
                className={`
                  transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${isSelected
                    ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400'
                    : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'
                  }
                `}
              >
                {showRowNumbers && (
                  <td className="px-3 py-3 text-sm text-white/30 tabular-nums">
                    {index + 1}
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-3 py-3 text-sm text-white/80"
                    style={{ width: column.width }}
                  >
                    {column.render
                      ? column.render(row, index)
                      : String((row as Record<string, unknown>)[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// TABLE ACTIONS BAR
// =============================================================================

export interface TableAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary';
}

export function TableActionsBar({
  actions,
  selectedCount = 0,
}: {
  actions: TableAction[];
  selectedCount?: number;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-t border-white/10">
      <div className="text-white/40 text-sm">
        {selectedCount > 0 ? `${selectedCount} selected` : 'All rows'}
      </div>
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${action.variant === 'primary'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }
            `}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// TABLE STATS BAR
// =============================================================================

export interface TableStat {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export function TableStatsBar({ stats }: { stats: TableStat[] }) {
  return (
    <div className="flex items-center gap-6 px-4 py-3 bg-white/[0.02] border-b border-white/10">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-2">
          {stat.icon && (
            <span className={stat.color || 'text-white/40'}>{stat.icon}</span>
          )}
          <span className="text-white/40 text-sm">{stat.label}:</span>
          <span className={`text-sm font-medium ${stat.color || 'text-white'}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
