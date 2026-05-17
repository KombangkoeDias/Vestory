import { CategoryId } from '../types';

// Keyword → category mapping. Order matters — first match wins.
// Keys are lowercase. Checked as substring of lowercased merchant name.
const KEYWORD_MAP: { keywords: string[]; category: CategoryId }[] = [
  // Food & Drinks — checked BEFORE transport so "grab food" hits food not transport
  {
    keywords: [
      'grab food', 'foodpanda', 'deliveroo', 'oddle', 'pickupp',
      'kopitiam', 'koufu', 'food republic', 'toast box', 'ya kun', 'yakun',
      "mcdonald's", 'mcdonalds', 'kfc', 'burger king', 'subway',
      'starbucks', 'coffee bean', 'costa coffee', 'do.re.mi', 'donut',
      'pizza', 'sushi', 'ramen', 'noodle', 'chicken rice', 'hawker',
      'restaurant', 'cafe', 'bakery', 'bistro', 'eatery', 'kitchen',
      'jollibee', 'popeyes', 'wendy', 'domino',
      // Thai
      'after you', 'swensen', 'the pizza company', 'dairy queen',
    ],
    category: 'food',
  },

  // Health — checked BEFORE shopping so "watsons" and "guardian" hit health
  {
    keywords: [
      'guardian', 'watsons', 'unity pharmacy', 'alpha pharmacy',
      'clinic', 'hospital', 'polyclinic', 'dental', 'doctor',
      'raffles medical', 'parkway', 'mount elizabeth', 'gleneagles',
      'ntuc health', 'physio', 'optician', 'optical',
      // Thai
      'bumrungrad', 'samitivej', 'bangkok hospital', 'boots pharmacy',
    ],
    category: 'health',
  },

  // Transport
  {
    keywords: [
      'grab', 'gojek', 'ryde', 'tada', 'comfort', 'comfortdelgro', 'cdg',
      'ez-link', 'ezlink', 'transit', 'mrt', 'smrt', 'sbs transit',
      'bus', 'taxi', 'uber', 'lyft', 'bolt', 'indriver',
      'parking', 'car park', 'esso', 'shell', 'caltex', 'sinopec',
      // Thai
      'bts', 'mrt tha', 'airport rail', 'bolt thai',
    ],
    category: 'transport',
  },

  // Groceries
  {
    keywords: [
      'ntuc', 'fairprice', 'cold storage', 'giant', 'sheng siong', 'prime supermarket',
      'jasons', "jason's", 'market place', 'little farms',
      // Thai
      'lotus', 'big c', 'makro', 'tops', 'villa market', 'gourmet market',
    ],
    category: 'groceries',
  },

  // Shopping
  {
    keywords: [
      'shopee', 'lazada', 'amazon', 'qoo10', 'zalora', 'redmart',
      'ikea', 'courts', 'harvey norman', 'best denki', 'challenger',
      'uniqlo', 'zara', 'h&m', 'hm', 'cotton on', 'charles keith',
      'pedro', 'tangs', 'takashimaya', 'isetan', 'metro',
      // Thai
      'central', 'robinson', 'emporium', 'terminal 21', 'siam paragon',
    ],
    category: 'shopping',
  },

  // Entertainment
  {
    keywords: [
      'netflix', 'spotify', 'apple music', 'youtube', 'disney',
      'steam', 'playstation', 'xbox', 'nintendo', 'epic games',
      'shaw theatres', 'cathay', 'golden village', 'gv', 'mm2',
      'escape room', 'bowling', 'arcade', 'karaoke', 'cinema',
      'concert', 'ticketmaster', 'sistic', 'klook', 'kkday',
    ],
    category: 'entertainment',
  },

  // Utilities
  {
    keywords: [
      'sp group', 'sp digital', 'singtel', 'starhub', 'm1', 'circles.life',
      'giga', 'electricity', 'utilities', 'town council', 'conservancy',
      'insurance', 'great eastern', 'prudential', 'aia', 'aviva', 'ntuc income',
      // Thai
      'pea electric', 'pwa water', 'ais', 'dtac', 'true move',
    ],
    category: 'utilities',
  },

  // Travel
  {
    keywords: [
      'airbnb', 'booking.com', 'agoda', 'expedia', 'klook travel',
      'airline', 'flight', 'airasia', 'singapore airlines', 'sia',
      'scoot', 'jetstar', 'thai airways', 'bangkok airways',
      'hotel', 'resort', 'hostel', 'inn',
    ],
    category: 'travel',
  },
];

const MERCHANT_OVERRIDE_CACHE: Map<string, CategoryId> = new Map();

export function categoriseMerchant(merchantName: string): CategoryId {
  if (!merchantName) return 'others';

  const lower = merchantName.toLowerCase();

  // Check runtime overrides first (user corrections)
  const override = MERCHANT_OVERRIDE_CACHE.get(lower);
  if (override) return override;

  for (const { keywords, category } of KEYWORD_MAP) {
    if (keywords.some(k => lower.includes(k))) return category;
  }

  return 'others';
}

// Called when user manually re-categorises a transaction
export function setMerchantOverride(merchantName: string, category: CategoryId): void {
  MERCHANT_OVERRIDE_CACHE.set(merchantName.toLowerCase(), category);
}
