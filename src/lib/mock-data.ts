// Mock data for demo flows

// =============================================================================
// CAR SEARCH FLOW
// =============================================================================

export interface CarResult {
  id: string;
  site: string;
  siteLogo?: string;
  status: 'success' | 'blocked' | 'no_results' | 'over_budget' | 'over_mileage' | 'no_carplay';
  car?: {
    year: number;
    make: string;
    model: string;
    trim: string;
    price: number;
    mileage: number;
    hasCarPlay: boolean;
    image: string;
    color: string;
    vin?: string;
  };
  dealer?: {
    name: string;
    distance: number;
    rating: number;
    reviewCount: number;
    address: string;
    phone: string;
    hours: string;
  };
  statusMessage?: string;
  wave: 1 | 2; // First wave or escalation wave
}

export const CAR_SEARCH_QUERY = "Find a used Honda Civic under $25k, under 50k miles, with Apple CarPlay";

export const CAR_SEARCH_RESULTS: CarResult[] = [
  // Wave 1 - Initial sites
  {
    id: 'cargurus',
    site: 'CarGurus',
    status: 'success',
    wave: 1,
    car: {
      year: 2022,
      make: 'Honda',
      model: 'Civic',
      trim: 'EX',
      price: 22400,
      mileage: 38000,
      hasCarPlay: true,
      image: '/images/demo/civic-silver.jpg',
      color: 'Lunar Silver Metallic',
    },
    dealer: {
      name: 'CarGurus Certified',
      distance: 15.3,
      rating: 4.2,
      reviewCount: 1247,
      address: '1234 Auto Row, Plano, TX',
      phone: '(214) 555-0123',
      hours: 'Open until 8pm',
    },
  },
  {
    id: 'carvana',
    site: 'Carvana',
    status: 'blocked',
    wave: 1,
    statusMessage: 'Blocked by Cloudflare',
  },
  {
    id: 'autotrader',
    site: 'AutoTrader',
    status: 'over_mileage',
    wave: 1,
    car: {
      year: 2020,
      make: 'Honda',
      model: 'Civic',
      trim: 'LX',
      price: 19800,
      mileage: 61000,
      hasCarPlay: true,
      image: '/images/demo/civic-black.jpg',
      color: 'Crystal Black Pearl',
    },
    statusMessage: 'Over your 50k mile limit',
  },
  {
    id: 'cars-com',
    site: 'Cars.com',
    status: 'success',
    wave: 1,
    car: {
      year: 2022,
      make: 'Honda',
      model: 'Civic',
      trim: 'Sport',
      price: 23100,
      mileage: 41000,
      hasCarPlay: true,
      image: '/images/demo/civic-blue.jpg',
      color: 'Aegean Blue Metallic',
    },
    dealer: {
      name: 'Metro Honda',
      distance: 22.1,
      rating: 4.4,
      reviewCount: 892,
      address: '5678 Commerce St, Irving, TX',
      phone: '(972) 555-0456',
      hours: 'Open until 9pm',
    },
  },
  {
    id: 'carmax',
    site: 'CarMax',
    status: 'over_budget',
    wave: 1,
    car: {
      year: 2023,
      make: 'Honda',
      model: 'Civic',
      trim: 'Touring',
      price: 26500,
      mileage: 28000,
      hasCarPlay: true,
      image: '/images/demo/civic-white.jpg',
      color: 'Platinum White Pearl',
    },
    statusMessage: 'Over your $25k budget',
  },
  {
    id: 'fb-marketplace',
    site: 'Facebook Marketplace',
    status: 'no_carplay',
    wave: 1,
    car: {
      year: 2021,
      make: 'Honda',
      model: 'Civic',
      trim: 'LX',
      price: 21000,
      mileage: 45000,
      hasCarPlay: false,
      image: '/images/demo/civic-red.jpg',
      color: 'Rallye Red',
    },
    statusMessage: 'Apple CarPlay not confirmed',
  },

  // Wave 2 - Escalation (dealerships)
  {
    id: 'honda-dallas',
    site: 'Honda of Dallas',
    status: 'success',
    wave: 2,
    car: {
      year: 2022,
      make: 'Honda',
      model: 'Civic',
      trim: 'EX',
      price: 21900,
      mileage: 35000,
      hasCarPlay: true,
      image: '/images/demo/civic-gray.jpg',
      color: 'Modern Steel Metallic',
      vin: '2HGFE2F59NH123456',
    },
    dealer: {
      name: 'Honda of Dallas',
      distance: 8.2,
      rating: 4.6,
      reviewCount: 892,
      address: '2100 N Central Expy, Dallas, TX 75201',
      phone: '(214) 555-0789',
      hours: 'Open until 8pm',
    },
  },
  {
    id: 'autonation',
    site: 'AutoNation Honda',
    status: 'success',
    wave: 2,
    car: {
      year: 2021,
      make: 'Honda',
      model: 'Civic',
      trim: 'EX-L',
      price: 23400,
      mileage: 44000,
      hasCarPlay: true,
      image: '/images/demo/civic-burgundy.jpg',
      color: 'San Marino Red',
    },
    dealer: {
      name: 'AutoNation Honda Lewisville',
      distance: 18.5,
      rating: 4.3,
      reviewCount: 654,
      address: '1000 S Stemmons Fwy, Lewisville, TX',
      phone: '(972) 555-0321',
      hours: 'Open until 9pm',
    },
  },
  {
    id: 'park-place',
    site: 'Park Place Honda',
    status: 'no_results',
    wave: 2,
    statusMessage: 'No matching inventory',
  },
  {
    id: 'craigslist-dallas',
    site: 'Craigslist Dallas',
    status: 'over_mileage',
    wave: 2,
    car: {
      year: 2019,
      make: 'Honda',
      model: 'Civic',
      trim: 'Sport',
      price: 17500,
      mileage: 68000,
      hasCarPlay: true,
      image: '/images/demo/civic-orange.jpg',
      color: 'Orange Fury',
    },
    statusMessage: 'Over your 50k mile limit',
  },
];

export const CAR_SEARCH_BEST_RESULT = CAR_SEARCH_RESULTS.find(r => r.id === 'honda-dallas')!;

export const CAR_SEARCH_SYNTHESIS = {
  headline: '2022 Honda Civic EX at Honda of Dallas',
  price: 21900,
  rationale: [
    'Lowest price meeting ALL your criteria',
    '35k miles — well under your 50k limit',
    'Apple CarPlay confirmed',
    'Local dealer (8.2 mi) — test drive today',
    'Dealer rating: 4.6★ (892 reviews)',
  ],
  pullQuote: 'Best match from 10 sources searched',
  primaryAction: {
    label: 'Schedule Test Drive',
    href: '#schedule',
  },
  secondaryAction: {
    label: 'Call Dealer',
    href: 'tel:+12145550789',
  },
};

// =============================================================================
// DATE NIGHT FLOW
// =============================================================================

export interface RestaurantResult {
  id: string;
  site: string;
  status: 'available' | 'no_results' | 'limited';
  restaurant?: {
    name: string;
    cuisine: string;
    priceLevel: 1 | 2 | 3 | 4; // $ to $$$$
    rating: number;
    reviewCount: number;
    image: string;
    vibe: string[];
    address: string;
    distance: number;
    availability: {
      time: string;
      partySize: number;
    };
  };
  statusMessage?: string;
}

export const DATE_NIGHT_QUERY = "Date night tonight in Dallas, nice Italian, 7pm for 2";

export const DATE_NIGHT_RESULTS: RestaurantResult[] = [
  {
    id: 'resy',
    site: 'Resy',
    status: 'available',
    restaurant: {
      name: 'Lucia',
      cuisine: 'Italian',
      priceLevel: 3,
      rating: 4.7,
      reviewCount: 1247,
      image: '/images/demo/lucia.jpg',
      vibe: ['Romantic', 'Intimate', 'Date Night'],
      address: '408 W 8th St, Dallas, TX 75208',
      distance: 4.2,
      availability: {
        time: '7:00pm',
        partySize: 2,
      },
    },
  },
  {
    id: 'opentable',
    site: 'OpenTable',
    status: 'available',
    restaurant: {
      name: 'Carbone',
      cuisine: 'Italian-American',
      priceLevel: 4,
      rating: 4.8,
      reviewCount: 892,
      image: '/images/demo/carbone.jpg',
      vibe: ['Upscale', 'Celebrity Scene', 'Special Occasion'],
      address: '2100 Ross Ave, Dallas, TX 75201',
      distance: 2.8,
      availability: {
        time: '7:15pm',
        partySize: 2,
      },
    },
  },
  {
    id: 'yelp',
    site: 'Yelp',
    status: 'available',
    restaurant: {
      name: 'North Italia',
      cuisine: 'Italian',
      priceLevel: 2,
      rating: 4.3,
      reviewCount: 2156,
      image: '/images/demo/north-italia.jpg',
      vibe: ['Upscale Casual', 'Lively', 'Great for Groups'],
      address: '8687 N Central Expy, Dallas, TX 75225',
      distance: 6.1,
      availability: {
        time: '7:30pm',
        partySize: 2,
      },
    },
  },
  {
    id: 'google',
    site: 'Google',
    status: 'available',
    restaurant: {
      name: 'Lucia', // Google found the same as Resy
      cuisine: 'Italian',
      priceLevel: 3,
      rating: 4.6,
      reviewCount: 847,
      image: '/images/demo/lucia.jpg',
      vibe: ['Romantic', 'Intimate'],
      address: '408 W 8th St, Dallas, TX 75208',
      distance: 4.2,
      availability: {
        time: '7:00pm',
        partySize: 2,
      },
    },
  },
  {
    id: 'tock',
    site: 'Tock',
    status: 'no_results',
    statusMessage: 'No Italian restaurants on platform',
  },
];

export const DATE_NIGHT_BEST_RESULT = DATE_NIGHT_RESULTS.find(r => r.id === 'resy')!;

export const DATE_NIGHT_SYNTHESIS = {
  headline: 'Lucia',
  subtitle: '7:00pm tonight',
  rating: 4.7,
  priceLevel: 3,
  cuisine: 'Italian',
  pullQuote: 'Best handmade pasta in Dallas. Intimate, romantic, perfect for date night.',
  rationale: [
    'Exact time you wanted (7pm)',
    'Highest rated Italian in your area',
    '"Romantic ambiance" mentioned in 80+ reviews',
    'Reservations still available (going fast)',
  ],
  primaryAction: {
    label: 'Reserve 7:00pm for 2',
    href: 'https://resy.com/lucia',
  },
  alternatives: [
    {
      id: 'carbone',
      name: 'Carbone',
      time: '7:15pm',
      priceLevel: 4,
      rating: 4.8,
      image: '/images/demo/carbone.jpg',
      tradeoff: 'Fancier, but 15 min later',
      pullQuote: 'NYC-style Italian, celebrity scene',
    },
    {
      id: 'north-italia',
      name: 'North Italia',
      time: '7:30pm',
      priceLevel: 2,
      rating: 4.3,
      image: '/images/demo/north-italia.jpg',
      tradeoff: 'More casual vibe, later slot',
      pullQuote: 'Upscale casual, great for groups',
    },
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('en-US').format(mileage) + ' mi';
}

export function formatPriceLevel(level: 1 | 2 | 3 | 4): string {
  return '$'.repeat(level);
}

export function formatRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return '★'.repeat(fullStars) + (hasHalf ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0));
}

// =============================================================================
// CFO LEAD GENERATION FLOW
// =============================================================================

export interface CFOResult {
  id: string;
  name: string;
  title: string;
  company: {
    name: string;
    type: 'hotel' | 'restaurant_group' | 'event_venue' | 'catering' | 'resort';
    employees: number;
    revenue?: string;
    headquarters: string;
    website?: string;
  };
  contact: {
    email?: string;
    emailVerified: boolean;
    linkedIn?: string;
    phone?: string;
  };
  source: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface CFOSourceResult {
  id: string;
  site: string;
  domain: string;
  status: 'success' | 'blocked' | 'paywalled' | 'no_results' | 'partial';
  wave: 1 | 2;
  resultsFound: number;
  statusMessage?: string;
}

export const CFO_SEARCH_QUERY = "Find hospitality group CFOs in the DFW area";

export const CFO_SEARCH_SOURCES: CFOSourceResult[] = [
  // Wave 1 - Business databases
  {
    id: 'linkedin',
    site: 'LinkedIn',
    domain: 'linkedin.com',
    status: 'success',
    wave: 1,
    resultsFound: 12,
  },
  {
    id: 'zoominfo',
    site: 'ZoomInfo',
    domain: 'zoominfo.com',
    status: 'paywalled',
    wave: 1,
    resultsFound: 0,
    statusMessage: 'Requires enterprise login',
  },
  {
    id: 'crunchbase',
    site: 'Crunchbase',
    domain: 'crunchbase.com',
    status: 'success',
    wave: 1,
    resultsFound: 8,
  },
  {
    id: 'apollo',
    site: 'Apollo.io',
    domain: 'apollo.io',
    status: 'partial',
    wave: 1,
    resultsFound: 6,
    statusMessage: 'Limited to 6 results without login',
  },
  {
    id: 'google-maps',
    site: 'Google Maps',
    domain: 'google.com/maps',
    status: 'success',
    wave: 1,
    resultsFound: 15,
  },
  {
    id: 'dbj',
    site: 'Dallas Business Journal',
    domain: 'bizjournals.com/dallas',
    status: 'success',
    wave: 1,
    resultsFound: 5,
  },

  // Wave 2 - Enrichment sources (spawned after company discovery)
  {
    id: 'company-websites',
    site: 'Company Websites',
    domain: 'various',
    status: 'success',
    wave: 2,
    resultsFound: 14,
  },
  {
    id: 'press-releases',
    site: 'Press Releases',
    domain: 'prweb.com',
    status: 'success',
    wave: 2,
    resultsFound: 4,
  },
  {
    id: 'sec-filings',
    site: 'SEC Filings',
    domain: 'sec.gov',
    status: 'success',
    wave: 2,
    resultsFound: 3,
  },
  {
    id: 'texas-biz',
    site: 'Texas Comptroller',
    domain: 'comptroller.texas.gov',
    status: 'success',
    wave: 2,
    resultsFound: 7,
  },
];

export const CFO_SEARCH_RESULTS: CFOResult[] = [
  {
    id: 'cfo-1',
    name: 'Sarah Mitchell',
    title: 'Chief Financial Officer',
    company: {
      name: 'Ashford Hospitality Trust',
      type: 'hotel',
      employees: 2400,
      revenue: '$1.2B',
      headquarters: 'Dallas, TX',
      website: 'ashfordhospitality.com',
    },
    contact: {
      email: 's.mitchell@ashfordhospitality.com',
      emailVerified: true,
      linkedIn: 'linkedin.com/in/sarah-mitchell-cfo',
      phone: '(214) 555-0101',
    },
    source: 'LinkedIn + SEC Filings',
    confidence: 'high',
  },
  {
    id: 'cfo-2',
    name: 'David Chen',
    title: 'CFO',
    company: {
      name: 'Omni Hotels & Resorts',
      type: 'hotel',
      employees: 1800,
      revenue: '$890M',
      headquarters: 'Dallas, TX',
      website: 'omnihotels.com',
    },
    contact: {
      email: 'dchen@omnihotels.com',
      emailVerified: true,
      linkedIn: 'linkedin.com/in/david-chen-omni',
      phone: '(214) 555-0102',
    },
    source: 'Crunchbase + Company Website',
    confidence: 'high',
  },
  {
    id: 'cfo-3',
    name: 'Jennifer Park',
    title: 'VP of Finance',
    company: {
      name: 'Mi Cocina Restaurant Group',
      type: 'restaurant_group',
      employees: 450,
      headquarters: 'Dallas, TX',
      website: 'micocina.com',
    },
    contact: {
      emailVerified: false,
      linkedIn: 'linkedin.com/in/jennifer-park-finance',
    },
    source: 'LinkedIn',
    confidence: 'medium',
  },
  {
    id: 'cfo-4',
    name: 'Marcus Williams',
    title: 'Chief Financial Officer',
    company: {
      name: "Del Frisco's Restaurant Group",
      type: 'restaurant_group',
      employees: 1200,
      revenue: '$340M',
      headquarters: 'Irving, TX',
      website: 'dfrg.com',
    },
    contact: {
      email: 'mwilliams@dfrg.com',
      emailVerified: true,
      linkedIn: 'linkedin.com/in/marcus-williams-dfrg',
    },
    source: 'SEC Filings + LinkedIn',
    confidence: 'high',
  },
  {
    id: 'cfo-5',
    name: 'Robert Hernandez',
    title: 'CFO',
    company: {
      name: 'Hospitality Ventures Management Group',
      type: 'hotel',
      employees: 650,
      headquarters: 'Addison, TX',
      website: 'hvmg.com',
    },
    contact: {
      email: 'rhernandez@hvmg.com',
      emailVerified: true,
      linkedIn: 'linkedin.com/in/robert-hernandez-hvmg',
      phone: '(972) 555-0201',
    },
    source: 'Company Website + Apollo',
    confidence: 'high',
  },
  {
    id: 'cfo-6',
    name: 'Amanda Foster',
    title: 'Chief Financial Officer',
    company: {
      name: 'Rosewood Hotel Group',
      type: 'resort',
      employees: 890,
      revenue: '$280M',
      headquarters: 'Dallas, TX',
      website: 'rosewoodhotels.com',
    },
    contact: {
      email: 'afoster@rosewoodhotels.com',
      emailVerified: true,
      linkedIn: 'linkedin.com/in/amanda-foster-rosewood',
    },
    source: 'Crunchbase + Press Release',
    confidence: 'high',
  },
  {
    id: 'cfo-7',
    name: 'Thomas Greene',
    title: 'VP Finance & Controller',
    company: {
      name: 'Pappas Restaurants',
      type: 'restaurant_group',
      employees: 3200,
      headquarters: 'Houston, TX (DFW ops)',
      website: 'pappas.com',
    },
    contact: {
      emailVerified: false,
      linkedIn: 'linkedin.com/in/thomas-greene-pappas',
    },
    source: 'LinkedIn',
    confidence: 'medium',
  },
  {
    id: 'cfo-8',
    name: 'Michelle Torres',
    title: 'CFO',
    company: {
      name: 'Wolfgang Puck Catering DFW',
      type: 'catering',
      employees: 180,
      headquarters: 'Dallas, TX',
      website: 'wolfgangpuck.com',
    },
    contact: {
      email: 'mtorres@wolfgangpuck.com',
      emailVerified: true,
      phone: '(214) 555-0303',
    },
    source: 'Company Website',
    confidence: 'high',
  },
  {
    id: 'cfo-9',
    name: 'Kevin O\'Brien',
    title: 'Chief Financial Officer',
    company: {
      name: 'Hilton DFW Lakes',
      type: 'hotel',
      employees: 420,
      headquarters: 'Grapevine, TX',
      website: 'hilton.com',
    },
    contact: {
      email: 'kevin.obrien@hilton.com',
      emailVerified: true,
      linkedIn: 'linkedin.com/in/kevin-obrien-hilton',
    },
    source: 'LinkedIn + Dallas Business Journal',
    confidence: 'high',
  },
  {
    id: 'cfo-10',
    name: 'Linda Chang',
    title: 'CFO',
    company: {
      name: 'Gaylord Texan Resort',
      type: 'resort',
      employees: 1100,
      revenue: '$180M',
      headquarters: 'Grapevine, TX',
      website: 'marriott.com/gaylord-texan',
    },
    contact: {
      email: 'lchang@gaylordhotels.com',
      emailVerified: true,
      linkedIn: 'linkedin.com/in/linda-chang-gaylord',
      phone: '(817) 555-0404',
    },
    source: 'Company Website + LinkedIn',
    confidence: 'high',
  },
  {
    id: 'cfo-11',
    name: 'Brian Patterson',
    title: 'VP of Finance',
    company: {
      name: 'Cru Wine Bar',
      type: 'restaurant_group',
      employees: 280,
      headquarters: 'Fort Worth, TX',
      website: 'cruwinebar.com',
    },
    contact: {
      emailVerified: false,
      linkedIn: 'linkedin.com/in/brian-patterson-cru',
    },
    source: 'LinkedIn',
    confidence: 'low',
  },
  {
    id: 'cfo-12',
    name: 'Rachel Kim',
    title: 'Chief Financial Officer',
    company: {
      name: 'ClubCorp Holdings',
      type: 'event_venue',
      employees: 2100,
      revenue: '$950M',
      headquarters: 'Dallas, TX',
      website: 'clubcorp.com',
    },
    contact: {
      email: 'rkim@clubcorp.com',
      emailVerified: true,
      linkedIn: 'linkedin.com/in/rachel-kim-clubcorp',
      phone: '(972) 555-0505',
    },
    source: 'SEC Filings + Crunchbase',
    confidence: 'high',
  },
  {
    id: 'cfo-13',
    name: 'James Morrison',
    title: 'CFO',
    company: {
      name: 'Wyndham Hotels DFW',
      type: 'hotel',
      employees: 580,
      headquarters: 'Irving, TX',
      website: 'wyndhamhotels.com',
    },
    contact: {
      email: 'james.morrison@wyndham.com',
      emailVerified: true,
      linkedIn: 'linkedin.com/in/james-morrison-wyndham',
    },
    source: 'Company Website + Apollo',
    confidence: 'high',
  },
  {
    id: 'cfo-14',
    name: 'Stephanie Reyes',
    title: 'Director of Finance',
    company: {
      name: 'Meso Maya Comida',
      type: 'restaurant_group',
      employees: 150,
      headquarters: 'Dallas, TX',
      website: 'mesomaya.com',
    },
    contact: {
      emailVerified: false,
      linkedIn: 'linkedin.com/in/stephanie-reyes-finance',
    },
    source: 'LinkedIn',
    confidence: 'medium',
  },
  {
    id: 'cfo-15',
    name: 'Christopher Blake',
    title: 'Chief Financial Officer',
    company: {
      name: 'The Worthington Renaissance',
      type: 'hotel',
      employees: 320,
      headquarters: 'Fort Worth, TX',
      website: 'marriott.com/worthington',
    },
    contact: {
      email: 'cblake@marriott.com',
      emailVerified: true,
      phone: '(817) 555-0606',
    },
    source: 'Dallas Business Journal + Company Website',
    confidence: 'high',
  },
  {
    id: 'cfo-16',
    name: 'Diana Martinez',
    title: 'CFO',
    company: {
      name: 'Truluck\'s Restaurant Group',
      type: 'restaurant_group',
      employees: 680,
      revenue: '$85M',
      headquarters: 'Austin, TX (DFW ops)',
      website: 'trulucks.com',
    },
    contact: {
      email: 'dmartinez@trulucks.com',
      emailVerified: true,
      linkedIn: 'linkedin.com/in/diana-martinez-trulucks',
    },
    source: 'Crunchbase + LinkedIn',
    confidence: 'high',
  },
  {
    id: 'cfo-17',
    name: 'Andrew Walsh',
    title: 'VP Finance',
    company: {
      name: 'AT&T Stadium Events',
      type: 'event_venue',
      employees: 450,
      headquarters: 'Arlington, TX',
      website: 'attstadium.com',
    },
    contact: {
      emailVerified: false,
      linkedIn: 'linkedin.com/in/andrew-walsh-att',
    },
    source: 'LinkedIn',
    confidence: 'low',
  },
  {
    id: 'cfo-18',
    name: 'Patricia Nguyen',
    title: 'Chief Financial Officer',
    company: {
      name: 'Commissioned Events & Catering',
      type: 'catering',
      employees: 95,
      headquarters: 'Plano, TX',
      website: 'commissionedevents.com',
    },
    contact: {
      email: 'pnguyen@commissionedevents.com',
      emailVerified: true,
      phone: '(469) 555-0707',
    },
    source: 'Company Website + Texas Comptroller',
    confidence: 'high',
  },
  {
    id: 'cfo-19',
    name: 'Richard Coleman',
    title: 'CFO',
    company: {
      name: 'La Quinta by Wyndham DFW',
      type: 'hotel',
      employees: 340,
      headquarters: 'Dallas, TX',
      website: 'laquinta.com',
    },
    contact: {
      email: 'rcoleman@laquinta.com',
      emailVerified: true,
      linkedIn: 'linkedin.com/in/richard-coleman-laquinta',
    },
    source: 'Apollo + Company Website',
    confidence: 'high',
  },
  {
    id: 'cfo-20',
    name: 'Elizabeth Sanders',
    title: 'Chief Financial Officer',
    company: {
      name: 'Maggiano\'s Little Italy (DFW)',
      type: 'restaurant_group',
      employees: 520,
      headquarters: 'Dallas, TX',
      website: 'maggianos.com',
    },
    contact: {
      email: 'esanders@bfrg.com',
      emailVerified: true,
      linkedIn: 'linkedin.com/in/elizabeth-sanders-maggianos',
    },
    source: 'Crunchbase + SEC Filings',
    confidence: 'high',
  },
];

export const CFO_SEARCH_SYNTHESIS = {
  headline: '20 Hospitality CFOs in DFW',
  subtitle: 'Found across 10 sources',
  stats: {
    totalFound: 20,
    emailsVerified: 15,
    linkedInProfiles: 18,
    phoneNumbers: 7,
    highConfidence: 14,
    companiesRepresented: 20,
  },
  insights: [
    '20 CFOs found across 20 hospitality groups',
    '75% have verified email addresses',
    'Company sizes range from 95 to 3,200 employees',
    '3 are at publicly traded companies (higher data quality)',
    'Largest segment: Hotels (8), followed by Restaurant Groups (7)',
  ],
  pivots: [
    { emoji: '🗺️', label: 'Expand to Texas', description: '42 more CFOs statewide' },
    { emoji: '📊', label: 'Add VPs of Finance', description: 'Include VP-level titles' },
    { emoji: '🏥', label: 'Try Healthcare CFOs', description: 'Different industry' },
    { emoji: '📧', label: 'Enrich missing emails', description: '5 contacts need data' },
  ],
};
