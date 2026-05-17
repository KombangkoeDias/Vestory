// Known bank email sender addresses and subject patterns.
// Used in Phase 3 to filter the Gmail inbox efficiently.

export interface BankConfig {
  name: string;
  country: 'SG' | 'TH';
  senderAddresses: string[];
  subjectKeywords: string[];
}

export const BANK_CONFIGS: BankConfig[] = [
  {
    name: 'DBS / POSB',
    country: 'SG',
    senderAddresses: [
      '@dbs.com',
      '@posb.com.sg',
    ],
    subjectKeywords: ['dbs', 'posb', 'transaction', 'card alert'],
  },
  {
    name: 'UOB',
    country: 'SG',
    senderAddresses: [
      // Confirmed real sender (unialerts@uobgroup.com)
      'unialerts@uobgroup.com',
      // Domain-level fallbacks — catches any address @uobgroup.com or @uob.com.sg
      '@uobgroup.com',
      '@uob.com.sg',
    ],
    subjectKeywords: ['uob', 'transaction', 'card', 'alert'],
  },
  {
    name: 'OCBC',
    country: 'SG',
    senderAddresses: ['@ocbc.com'],
    subjectKeywords: ['ocbc', 'transaction', 'card alert'],
  },
  {
    name: 'Maybank',
    country: 'SG',
    senderAddresses: ['@maybank.com.sg', '@maybank.com'],
    subjectKeywords: ['maybank', 'transaction', 'card'],
  },
  {
    name: 'Citibank',
    country: 'SG',
    senderAddresses: ['@citibank.com.sg', '@citi.com'],
    subjectKeywords: ['citi', 'transaction', 'card alert'],
  },
  {
    name: 'Krungthai Bank (KTB)',
    country: 'TH',
    senderAddresses: ['@ktb.co.th', '@krungthai.com'],
    subjectKeywords: ['krungthai', 'ktb', 'การทำรายการ', 'transaction'],
  },
  {
    name: 'Bangkok Bank',
    country: 'TH',
    senderAddresses: ['@bangkokbank.com'],
    subjectKeywords: ['bangkok bank', 'bbl', 'transaction'],
  },
  {
    name: 'Kasikorn Bank (KBank)',
    country: 'TH',
    senderAddresses: ['@kasikornbank.com'],
    subjectKeywords: ['kasikorn', 'kbank', 'transaction'],
  },
];

// Build a Gmail search query that matches any bank sender
export function buildGmailQuery(daysBack: number = 90): string {
  const allSenders = BANK_CONFIGS.flatMap(b => b.senderAddresses);
  const fromQuery = allSenders.map(s => `from:${s}`).join(' OR ');
  const after = new Date();
  after.setDate(after.getDate() - daysBack);
  const afterStr = `${after.getFullYear()}/${after.getMonth() + 1}/${after.getDate()}`;
  return `(${fromQuery}) after:${afterStr}`;
}

// Check if an email sender is a known bank
export function isKnownBankSender(fromAddress: string): boolean {
  const lower = fromAddress.toLowerCase();
  return BANK_CONFIGS.some(b =>
    b.senderAddresses.some(addr => lower.includes(addr.toLowerCase()))
  );
}
