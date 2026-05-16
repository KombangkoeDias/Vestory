import { Transaction } from '../types';
import { parseEmail } from './emailParser';
import { categoriseMerchant, setMerchantOverride } from './merchantCategoriser';
import { getMerchantOverrides, getStoredEmailIds, insertTransactions } from './database';
import { getValidToken, listMessages, getMessage } from './gmailClient';
import { buildGmailQuery, isKnownBankSender } from '../constants/BankSenders';
import { GOOGLE_IOS_CLIENT_ID, INITIAL_SYNC_DAYS } from '../constants/Config';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface SyncResult {
  fetched: number;
  parsed: number;
  inserted: number;
  skipped: number;
  errors: number;
}

export interface SyncProgress {
  stage: 'fetching' | 'parsing' | 'done' | 'error';
  current: number;
  total: number;
  message: string;
}

type ProgressCallback = (progress: SyncProgress) => void;

// ---------------------------------------------------------------------------
// Main sync function
// ---------------------------------------------------------------------------

export async function syncEmails(
  onProgress?: ProgressCallback,
  daysBack: number = INITIAL_SYNC_DAYS,
): Promise<SyncResult> {
  const result: SyncResult = { fetched: 0, parsed: 0, inserted: 0, skipped: 0, errors: 0 };

  onProgress?.({ stage: 'fetching', current: 0, total: 0, message: 'Connecting to Gmail...' });

  // Get valid OAuth token
  const token = await getValidToken(GOOGLE_IOS_CLIENT_ID);
  if (!token) throw new Error('Not authenticated. Please sign in first.');

  // Load merchant overrides from DB so categoriser uses user corrections
  const overrides = await getMerchantOverrides();
  Object.entries(overrides).forEach(([merchant, category]) => {
    setMerchantOverride(merchant, category);
  });

  // Get already-stored email IDs to avoid reprocessing
  const storedIds = await getStoredEmailIds();

  // Build Gmail query for bank emails
  const query = buildGmailQuery(daysBack);

  onProgress?.({ stage: 'fetching', current: 0, total: 0, message: 'Fetching email list...' });

  // Fetch list of matching message IDs
  const messages = await listMessages(token, query, 500);
  result.fetched = messages.length;

  if (messages.length === 0) {
    onProgress?.({ stage: 'done', current: 0, total: 0, message: 'No bank emails found.' });
    return result;
  }

  // Filter out already-stored emails
  const toProcess = messages.filter(m => !storedIds.has(m.id));
  result.skipped = messages.length - toProcess.length;

  onProgress?.({
    stage: 'parsing',
    current: 0,
    total: toProcess.length,
    message: `Parsing ${toProcess.length} new emails...`,
  });

  const newTransactions: Transaction[] = [];

  // Process in batches of 10 to avoid overwhelming the API
  const BATCH = 10;
  for (let i = 0; i < toProcess.length; i += BATCH) {
    const batch = toProcess.slice(i, i + BATCH);

    await Promise.all(
      batch.map(async msg => {
        try {
          const detail = await getMessage(token, msg.id);
          if (!detail) { result.errors++; return; }

          // Extra filter: only process known bank senders
          if (!isKnownBankSender(detail.from)) { result.skipped++; return; }

          const parsed = parseEmail(detail.subject, detail.body);

          // Skip low-confidence results or missing amounts
          if (!parsed.amount || parsed.confidence === 'low') { result.skipped++; return; }

          const merchant = parsed.merchant ?? 'Unknown';
          const category = categoriseMerchant(merchant);

          const transaction: Transaction = {
            id: uuidv4(),
            merchant,
            amount: parsed.amount,
            currency: parsed.currency ?? 'SGD',
            category,
            type: parsed.type,
            date: parsed.date ?? new Date().toISOString().split('T')[0],
            emailId: detail.id,
            rawSubject: detail.subject,
          };

          newTransactions.push(transaction);
          result.parsed++;
        } catch {
          result.errors++;
        }
      }),
    );

    onProgress?.({
      stage: 'parsing',
      current: Math.min(i + BATCH, toProcess.length),
      total: toProcess.length,
      message: `Parsed ${Math.min(i + BATCH, toProcess.length)} of ${toProcess.length}...`,
    });
  }

  // Bulk insert all new transactions
  if (newTransactions.length > 0) {
    await insertTransactions(newTransactions);
    result.inserted = newTransactions.length;
  }

  onProgress?.({
    stage: 'done',
    current: toProcess.length,
    total: toProcess.length,
    message: `Done. Added ${result.inserted} new transactions.`,
  });

  return result;
}
