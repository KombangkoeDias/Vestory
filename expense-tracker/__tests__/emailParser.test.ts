import { parseEmail } from '../utils/emailParser';
import { categoriseMerchant } from '../utils/merchantCategoriser';
import { isKnownBankSender } from '../constants/BankSenders';

// ---------------------------------------------------------------------------
// Sample bank email bodies (realistic templates)
// ---------------------------------------------------------------------------

const DBS_PURCHASE = {
  subject: 'DBS Card Transaction Alert',
  body: `Dear Customer,

A purchase transaction of SGD 45.00 has been made at GRAB FOOD PTE LTD on 16 May 2026 at 12:30 PM using your DBS Visa Card ending 1234.

If you did not make this transaction, please call us immediately.`,
};

const UOB_PURCHASE = {
  subject: 'UOB Card Transaction Notification',
  body: `Dear UOB Customer,

A transaction of SGD 12.50 was made using your UOB Credit Card (ending 5678) at KOUFU PTE LTD on 16/05/2026.

For queries, please contact UOB Call Centre.`,
};

const OCBC_PURCHASE = {
  subject: 'OCBC Card Alert: Transaction Notification',
  body: `Your OCBC card ending 9012 was used for a transaction of SGD 89.90 at NTUC FAIRPRICE on 15 May 2026.`,
};

const KTB_PURCHASE = {
  subject: 'KTB Transaction Alert',
  body: `Dear Customer, your KTB account has been debited ฿1,200.00 at LOTUS'S on 14 May 2026. Reference: 123456789.`,
};

const DBS_TRANSFER = {
  subject: 'DBS PayNow Transfer Notification',
  body: `You have successfully transferred SGD 200.00 to John Tan via PayNow on 16 May 2026 at 09:15 AM.`,
};

const OCBC_CREDIT = {
  subject: 'OCBC Cashback Credit',
  body: `A cashback of SGD 5.00 has been credited to your OCBC card ending 9012 on 15 May 2026.`,
};

const MAYBANK_PURCHASE = {
  subject: 'Maybank Card Alert',
  body: `Transaction Alert: SGD 23.40 has been charged to your Maybank card ending 3456 at WATSONS SINGAPORE on 2026-05-13.`,
};

// Real UOB email confirmed by user
const UOB_REAL = {
  subject: 'UOB - Transaction Alert',
  from: 'unialerts@uobgroup.com',
  body: `A transaction of SGD 1.28 was made with your UOB Card ending 0835 on 16/05/26 at BUS/MRT. If unauthorised, call 24/7 Fraud Hotline now`,
};

const USD_PURCHASE = {
  subject: 'DBS Card Alert - Foreign Currency Transaction',
  body: `A purchase of USD 29.99 was made at NETFLIX.COM on 14 May 2026 using your DBS card ending 1234.`,
};

// ---------------------------------------------------------------------------
// Parser tests
// ---------------------------------------------------------------------------

describe('emailParser — amount extraction', () => {
  test('extracts SGD amount with space', () => {
    const r = parseEmail(DBS_PURCHASE.subject, DBS_PURCHASE.body);
    expect(r.amount).toBe(45.00);
  });

  test('extracts SGD amount without space', () => {
    const r = parseEmail(UOB_PURCHASE.subject, UOB_PURCHASE.body);
    expect(r.amount).toBe(12.50);
  });

  test('extracts THB amount with ฿ symbol', () => {
    const r = parseEmail(KTB_PURCHASE.subject, KTB_PURCHASE.body);
    expect(r.amount).toBe(1200.00);
  });

  test('extracts USD amount', () => {
    const r = parseEmail(USD_PURCHASE.subject, USD_PURCHASE.body);
    expect(r.amount).toBe(29.99);
  });

  test('extracts amount with comma thousands separator', () => {
    const r = parseEmail('Test', 'SGD 1,234.56 at STORE');
    expect(r.amount).toBe(1234.56);
  });
});

describe('emailParser — currency extraction', () => {
  test('detects SGD', () => {
    expect(parseEmail(DBS_PURCHASE.subject, DBS_PURCHASE.body).currency).toBe('SGD');
  });

  test('detects THB from ฿ symbol', () => {
    expect(parseEmail(KTB_PURCHASE.subject, KTB_PURCHASE.body).currency).toBe('THB');
  });

  test('detects USD', () => {
    expect(parseEmail(USD_PURCHASE.subject, USD_PURCHASE.body).currency).toBe('USD');
  });
});

describe('emailParser — merchant extraction', () => {
  test('extracts merchant after "at" trigger', () => {
    const r = parseEmail(DBS_PURCHASE.subject, DBS_PURCHASE.body);
    expect(r.merchant).toBeTruthy();
    expect(r.merchant!.toLowerCase()).toContain('grab food');
  });

  test('extracts merchant from OCBC format', () => {
    const r = parseEmail(OCBC_PURCHASE.subject, OCBC_PURCHASE.body);
    expect(r.merchant).toBeTruthy();
    expect(r.merchant!.toLowerCase()).toContain('ntuc fairprice');
  });

  test('extracts merchant from KTB format', () => {
    const r = parseEmail(KTB_PURCHASE.subject, KTB_PURCHASE.body);
    expect(r.merchant).toBeTruthy();
  });
});

describe('emailParser — date extraction', () => {
  test('parses "16 May 2026" format', () => {
    expect(parseEmail(DBS_PURCHASE.subject, DBS_PURCHASE.body).date).toBe('2026-05-16');
  });

  test('parses DD/MM/YYYY format', () => {
    expect(parseEmail(UOB_PURCHASE.subject, UOB_PURCHASE.body).date).toBe('2026-05-16');
  });

  test('parses ISO YYYY-MM-DD format', () => {
    expect(parseEmail(MAYBANK_PURCHASE.subject, MAYBANK_PURCHASE.body).date).toBe('2026-05-13');
  });
});

describe('emailParser — transaction type', () => {
  test('detects purchase', () => {
    expect(parseEmail(DBS_PURCHASE.subject, DBS_PURCHASE.body).type).toBe('purchase');
  });

  test('detects transfer from PayNow', () => {
    expect(parseEmail(DBS_TRANSFER.subject, DBS_TRANSFER.body).type).toBe('transfer');
  });

  test('detects credit from cashback', () => {
    expect(parseEmail(OCBC_CREDIT.subject, OCBC_CREDIT.body).type).toBe('credit');
  });
});

describe('emailParser — real UOB email (DD/MM/YY date, BUS/MRT merchant)', () => {
  test('extracts amount', () => {
    expect(parseEmail(UOB_REAL.subject, UOB_REAL.body).amount).toBe(1.28);
  });
  test('extracts currency', () => {
    expect(parseEmail(UOB_REAL.subject, UOB_REAL.body).currency).toBe('SGD');
  });
  test('parses 2-digit year date DD/MM/YY → YYYY-MM-DD', () => {
    expect(parseEmail(UOB_REAL.subject, UOB_REAL.body).date).toBe('2026-05-16');
  });
  test('extracts BUS/MRT merchant', () => {
    const r = parseEmail(UOB_REAL.subject, UOB_REAL.body);
    expect(r.merchant).toBeTruthy();
    expect(r.merchant!.toUpperCase()).toContain('BUS');
  });
  test('confidence is high', () => {
    expect(parseEmail(UOB_REAL.subject, UOB_REAL.body).confidence).toBe('high');
  });
});

describe('emailParser — confidence scoring', () => {
  test('high confidence when all fields extracted', () => {
    expect(parseEmail(DBS_PURCHASE.subject, DBS_PURCHASE.body).confidence).toBe('high');
  });

  test('low confidence on empty email', () => {
    expect(parseEmail('', '').confidence).toBe('low');
  });
});

// ---------------------------------------------------------------------------
// Merchant categoriser tests
// ---------------------------------------------------------------------------

describe('isKnownBankSender', () => {
  test('recognises real UOB sender unialerts@uobgroup.com', () => {
    expect(isKnownBankSender('unialerts@uobgroup.com')).toBe(true);
  });
  test('recognises any @uobgroup.com address', () => {
    expect(isKnownBankSender('alerts@uobgroup.com')).toBe(true);
  });
  test('recognises @dbs.com address', () => {
    expect(isKnownBankSender('donotreply@dbs.com')).toBe(true);
  });
  test('rejects unknown sender', () => {
    expect(isKnownBankSender('noreply@somestore.com')).toBe(false);
  });
});

describe('merchantCategoriser', () => {
  test('Grab Food → food', () => expect(categoriseMerchant('GRAB FOOD')).toBe('food'));
  test('Grab → transport', () => expect(categoriseMerchant('GRAB')).toBe('transport'));
  test('NTUC FairPrice → groceries', () => expect(categoriseMerchant('NTUC FAIRPRICE')).toBe('groceries'));
  test('MRT → transport', () => expect(categoriseMerchant('MRT')).toBe('transport'));
  test('Netflix → entertainment', () => expect(categoriseMerchant('NETFLIX')).toBe('entertainment'));
  test('SP Group → utilities', () => expect(categoriseMerchant('SP GROUP')).toBe('utilities'));
  test('Starbucks → food', () => expect(categoriseMerchant('STARBUCKS')).toBe('food'));
  test('Watsons → health', () => expect(categoriseMerchant('WATSONS')).toBe('health'));
  test('Shopee → shopping', () => expect(categoriseMerchant('SHOPEE')).toBe('shopping'));
  test('Agoda → travel', () => expect(categoriseMerchant('AGODA')).toBe('travel'));
  test('Unknown merchant → others', () => expect(categoriseMerchant('RANDOM SHOP XYZ')).toBe('others'));
  test('Empty string → others', () => expect(categoriseMerchant('')).toBe('others'));
});
