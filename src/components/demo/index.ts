// =============================================================================
// DEMO COMPONENTS - Shared components for cascade demo pages
// =============================================================================

// Types
export * from './types';

// Timeline components
export {
  TimelineContainer,
  TimelineStep,
  TimelineResultStep,
  TimelineFinalStep,
} from './timeline';

// Source components
export {
  SourceRow,
  SourcesList,
  BrowserWindow,
  SearchPanel,
} from './sources';

// Popover components
export {
  TransparencyView,
  AdjustSearchView,
} from './popovers';

// Filter components
export {
  SearchFiltersWrapper,
  ThinkingDots,
  FilterOption,
  FilterLabel,
} from './filters';

// Layout components
export {
  DemoHeader,
  DemoLayout,
  WhatsNextActions,
  WhatsNextLabel,
  SignUpOverlay,
} from './layout';

// Agent components
export {
  AgentThoughts,
  AgentLog,
  InlineAgentStatus,
  type AgentThought,
} from './agent';
