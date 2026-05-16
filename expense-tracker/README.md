# Vestory — Expense Tracker

A privacy-first expense tracker that reads bank notification emails and parses them on-device. Nothing leaves your phone.

## Phase 1 Status: UI Complete (Mock Data)

All three screens are built with mock data. Gmail integration comes in Phase 3.

## Running on your iPhone

1. Install Expo Go on your iPhone from the App Store
2. Make sure your Mac and iPhone are on the same Wi-Fi
3. Run the app:

```bash
cd expense-tracker
npm install
npx expo start
```

4. Scan the QR code in your terminal with your iPhone camera

## Project Structure

```
app/
  (tabs)/
    index.tsx          # Dashboard screen
    two.tsx            # Transactions screen
    settings.tsx       # Settings screen
    _layout.tsx        # Tab bar config
components/
  TransactionItem.tsx  # Single transaction row
  CategoryBar.tsx      # Category spending bar
  SpendingChart.tsx    # Daily spending bar chart
  MonthSelector.tsx    # Month navigation
constants/
  Colors.ts            # Design tokens
  Categories.ts        # Category definitions with icons & colours
  MockData.ts          # Sample transactions for Phase 1
types/
  index.ts             # TypeScript interfaces
utils/
  transactions.ts      # Formatting, grouping, summarising helpers
```

## Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Done | UI + Navigation + Mock Data |
| 2 | Pending | Email parser + SQLite database |
| 3 | Pending | Gmail OAuth + live email sync |
| 4 | Pending | Polish + edge cases |
