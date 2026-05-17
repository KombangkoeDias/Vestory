import { Currency, TransactionType } from '../types';

export interface ParsedEmail {
  amount: number | null;
  currency: Currency | null;
  merchant: string | null;
  date: string | null; // YYYY-MM-DD
  type: TransactionType;
  confidence: 'high' | 'medium' | 'low';
  raw: string;
}

// ---------------------------------------------------------------------------
// Amount extraction
// ---------------------------------------------------------------------------

// Matches: SGD 1,234.56 / SGD1234.56 / 1,234.56 SGD / 1234.56SGD
const AMOUNT_PATTERNS = [
  /(?:SGD|USD|THB|S\$|US\$)\s*([\d,]+(?:\.\d{1,2})?)/i,
  /฿\s*([\d,]+(?:\.\d{1,2})?)/,
  /\$\s*([\d,]+(?:\.\d{1,2})?)/,
  /([\d,]+(?:\.\d{1,2})?)\s*(?:SGD|USD|THB)/i,
  // Thai baht written as number then THB
  /([\d,]+(?:\.\d{1,2})?)\s*(?:บาท)/,
];

function extractAmount(text: string): number | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const raw = match[1].replace(/,/g, '');
      const value = parseFloat(raw);
      if (!isNaN(value) && value > 0) return value;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Currency extraction
// ---------------------------------------------------------------------------

function extractCurrency(text: string): Currency | null {
  const upper = text.toUpperCase();
  if (upper.includes('SGD') || upper.includes('S$')) return 'SGD';
  if (upper.includes('THB') || text.includes('฿') || upper.includes('บาท')) return 'THB';
  if (upper.includes('USD') || upper.includes('US$')) return 'USD';
  // Bare $ defaults to SGD in Singapore context
  if (text.includes('$')) return 'SGD';
  return null;
}

// ---------------------------------------------------------------------------
// Date extraction
// ---------------------------------------------------------------------------

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function padTwo(n: string): string {
  return n.padStart(2, '0');
}

function extractDate(text: string): string | null {
  // ISO: 2026-05-16
  let m = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  // DD/MM/YYYY or DD-MM-YYYY
  m = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (m) return `${m[3]}-${padTwo(m[2])}-${padTwo(m[1])}`;

  // DD MMM YYYY — "16 May 2026" or "16-May-2026"
  m = text.match(/\b(\d{1,2})[\s\-]([A-Za-z]{3,9})[\s\-](\d{4})\b/);
  if (m) {
    const mon = MONTHS[m[2].toLowerCase().slice(0, 3)];
    if (mon) return `${m[3]}-${mon}-${padTwo(m[1])}`;
  }

  // MMM DD, YYYY — "May 16, 2026"
  m = text.match(/\b([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})\b/);
  if (m) {
    const mon = MONTHS[m[1].toLowerCase().slice(0, 3)];
    if (mon) return `${m[3]}-${mon}-${padTwo(m[2])}`;
  }

  // DD/MM/YY
  m = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})\b/);
  if (m) return `20${m[3]}-${padTwo(m[2])}-${padTwo(m[1])}`;

  // Fallback: today's date
  const today = new Date();
  return `${today.getFullYear()}-${padTwo(String(today.getMonth() + 1))}-${padTwo(String(today.getDate()))}`;
}

// ---------------------------------------------------------------------------
// Transaction type extraction
// ---------------------------------------------------------------------------

const TYPE_KEYWORDS: { keywords: string[]; type: TransactionType }[] = [
  { keywords: ['refund', 'cashback', 'reversal', 'credit', 'received', 'incoming'], type: 'credit' },
  { keywords: ['transfer', 'paynow', 'pay now', 'fast transfer', 'telegraphic', 'remittance'], type: 'transfer' },
  { keywords: ['withdrawal', 'atm', 'cash out', 'withdraw'], type: 'withdrawal' },
  { keywords: ['purchase', 'payment', 'debit', 'spent', 'charged', 'transaction', 'pos'], type: 'purchase' },
];

function extractType(text: string): TransactionType {
  const lower = text.toLowerCase();
  for (const { keywords, type } of TYPE_KEYWORDS) {
    if (keywords.some(k => lower.includes(k))) return type;
  }
  return 'purchase';
}

// ---------------------------------------------------------------------------
// Merchant extraction
// ---------------------------------------------------------------------------

// Words that appear in bank emails but are NOT merchant names
const BOILERPLATE = new Set([
  'dear', 'customer', 'account', 'card', 'ending', 'your', 'you', 'have',
  'has', 'been', 'made', 'with', 'for', 'the', 'a', 'an', 'at', 'on', 'via',
  'using', 'from', 'to', 'of', 'in', 'is', 'was', 'sgd', 'usd', 'thb',
  'purchase', 'payment', 'transaction', 'debit', 'credit', 'transfer',
  'please', 'contact', 'bank', 'alert', 'notification', 'message',
  'authorised', 'authorized', 'approved', 'declined', 'successful',
  'amount', 'total', 'balance', 'available', 'ref', 'reference',
  'dbs', 'uob', 'ocbc', 'posb', 'maybank', 'citibank', 'hsbc', 'standard',
  'chartered', 'krungthai', 'ktb', 'kasikorn', 'bangkok',
]);

// Trigger phrases — merchant name often follows these
const MERCHANT_TRIGGERS = [
  /\bat\s+([A-Z][A-Z0-9\s\.\-\&\'\/]{2,40}?)(?:\s+on\b|\s+for\b|\s+sgd\b|\s+usd\b|\s+thb\b|\.|,|$)/i,
  /\bto\s+([A-Z][A-Z0-9\s\.\-\&\'\/]{2,40}?)(?:\s+on\b|\s+for\b|\s+sgd\b|\s+usd\b|\s+thb\b|\.|,|$)/i,
  /merchant[:\s]+([A-Z][A-Z0-9\s\.\-\&\'\/]{2,40}?)(?:\s+on\b|\s+for\b|\.|,|$)/i,
  /paid\s+to\s+([A-Z][A-Z0-9\s\.\-\&\'\/]{2,40}?)(?:\s+on\b|\s+for\b|\.|,|$)/i,
];

function cleanMerchant(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    // Remove trailing noise like "PTE LTD", "CO LTD", "SDN BHD" for display
    .replace(/\s+(PTE\.?\s*LTD\.?|CO\.?\s*LTD\.?|SDN\.?\s*BHD\.?|INC\.?|LLC\.?)\s*$/i, '')
    .trim();
}

function extractMerchant(text: string): string | null {
  // Try trigger phrases first
  for (const pattern of MERCHANT_TRIGGERS) {
    const m = text.match(pattern);
    if (m) {
      const candidate = cleanMerchant(m[1]);
      const words = candidate.toLowerCase().split(' ');
      if (words.some(w => !BOILERPLATE.has(w)) && candidate.length > 1) {
        return candidate;
      }
    }
  }

  // Fallback: find the longest ALL-CAPS word sequence that isn't boilerplate
  const capsBlocks = text.match(/[A-Z][A-Z0-9\s\.\-\&\'\/]{3,40}/g) ?? [];
  const candidates = capsBlocks
    .map(cleanMerchant)
    .filter(c => {
      const words = c.toLowerCase().split(' ');
      return words.some(w => !BOILERPLATE.has(w));
    })
    .sort((a, b) => b.length - a.length);

  return candidates[0] ?? null;
}

// ---------------------------------------------------------------------------
// Confidence scoring
// ---------------------------------------------------------------------------

function scoreConfidence(parsed: Omit<ParsedEmail, 'confidence' | 'raw'>): ParsedEmail['confidence'] {
  const score =
    (parsed.amount !== null ? 2 : 0) +
    (parsed.currency !== null ? 1 : 0) +
    (parsed.merchant !== null ? 1 : 0) +
    (parsed.date !== null ? 1 : 0);
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

// ---------------------------------------------------------------------------
// Main parse function
// ---------------------------------------------------------------------------

export function parseEmail(subject: string, body: string): ParsedEmail {
  // Combine subject and first 500 chars of body for context
  const text = `${subject}\n${body.slice(0, 500)}`;

  const amount = extractAmount(text);
  const currency = extractCurrency(text);
  const date = extractDate(text);
  const merchant = extractMerchant(text);
  const type = extractType(text);

  const partial = { amount, currency, merchant, date, type };

  return {
    ...partial,
    confidence: scoreConfidence(partial),
    raw: subject,
  };
}

// ---------------------------------------------------------------------------
// Quick subject-only parse (used for fast scanning of many emails)
// ---------------------------------------------------------------------------

export function parseSubject(subject: string): ParsedEmail {
  return parseEmail(subject, '');
}
