import { BrowserPreset, BrowserPresetKey } from '@/types';

export const API_CONFIG = {
  BACKEND_URL: 'https://aitinyfish.com',
  // Demo token - replace with your own or add token input
  AUTH_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hcmlvQHRpbnlmaXNoLmlvIiwibmFtZSI6Ik1hcmlvIEVseXNpYW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSlhoSmkxamZpSTFUNnpsVER4VjlZSHlxOWlsVnlyU005U19LTjV5d1p0WnNuNFQyZz1zOTYtYyIsImV4cCI6MTc2NTA0Nzg2OH0.u6Th33uM2WaHJmbkYVdN91ReGa5TTkT9Wgr5pXk8uSA',
} as const;

export const BROWSER_PRESETS: Record<BrowserPresetKey, BrowserPreset> = {
  BASIC: {
    label: 'Basic',
    description: 'Standard browser session',
    browser_type: 'tetra',
    proxy_enabled: false,
  },
  STEALTH: {
    label: 'Stealth',
    description: 'Browser with anti-detection',
    browser_type: 'tetra-anchor',
    proxy_enabled: false,
  },
  GEO_US: {
    label: 'US Proxy',
    description: 'Browser with US geolocation',
    browser_type: 'tetra',
    proxy_enabled: true,
    proxy_country_code: 'US',
  },
  GEO_EU: {
    label: 'EU Proxy',
    description: 'Browser with EU geolocation',
    browser_type: 'tetra',
    proxy_enabled: true,
    proxy_country_code: 'DE',
  },
};

export const EXAMPLE_QUERIES = [
  'Find USPS shipping cost for a 5lb box from SF to Boston',
  'What is the price of AirPods Pro on apple.com?',
  'Find the hours of Tartine Bakery in San Francisco',
];
