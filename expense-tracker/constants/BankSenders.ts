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
      'donotreply@dbs.com',
      'dbs@dbs.com',
      'posb@posb.com.sg',
      'dbsalerts@dbs.com',
    ],
    subjectKeywords: ['dbs', 'posb', 'transaction', 'card alert'],
  },
  {
    name: 'UOB',
    country: 'SG',
    senderAddresses: [
      'uob@uob.com.sg',
      'donotreply@uob.com.sg',
      'alerts@uob.com.sg',
      'notification@uob.com.sg',
    ],
    subjectKeywords: ['uob', 'transaction', 'card', 'alert'],
  },
  {
    name: 'OCBC',
    country: 'SG',
    senderAddresses: [
      'ocbc@ocbc.com',
      'alerts@ocbc.com',
      'donotreply@ocbc.com',
    ],
    subjectKeywords: ['ocbc', 'transaction', 'card alert'],
  },
  {
    name: 'Maybank',
    country: 'SG',
    senderAddresses: [
      'maybank2u@maybank.com.sg',
      'alerts@maybank.com.sg',
      'donotreply@maybank.com.sg',
    ],
    subjectKeywords: ['maybank', 'transaction', 'card'],
  },
  {
    name: 'Citibank',
    country: 'SG',
    senderAddresses: [
      'citibank@email.citibank.com.sg',
      'alerts@citibank.com.sg',
    ],
    subjectKeywords: ['citi', 'transaction', 'card alert'],
  },
  {
    name: 'Krungthai Bank (KTB)',
    country: 'TH',
    senderAddresses: [
      'alert@ktb.co.th',
      'noreply@ktb.co.th',
      'notification@ktb.co.th',
    ],
    subjectKeywords: ['krungthai', 'ktb', 'การทำรายการ', 'transaction'],
  },
  {
    name: 'Bangkok Bank',
    country: 'TH',
    senderAddresses: [
      'alert@bangkokbank.com',
      'noreply@bangkokbank.com',
    ],
    subjectKeywords: ['bangkok bank', 'bbl', 'transaction'],
  },
  {
    name: 'Kasikorn Bank (KBank)',
    country: 'TH',
    senderAddresses: [
      'kbank@kasikornbank.com',
      'alert@kasikornbank.com',
      'noreply@kasikornbank.com',
    ],
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
