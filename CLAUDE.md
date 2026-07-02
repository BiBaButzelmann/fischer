# Project conventions for Claude

## Package manager
Always use `bun` — never `npm` or `npx`.

```
bun run dev
bun run build
bun run test
bun add <package>
```

## Next.js version
Project is on **15.1.9**. `experimental.dynamicIO` and `"use cache"` are not available — they require canary / Next.js 16. Use `unstable_cache` from `next/cache` for caching.

## Dates & time — two worlds, never mix
All helpers live in `src/lib/date.ts` (Luxon). The tournament is a physical event in Hamburg, so `Europe/Berlin` is the event timezone.

**Calendar days** (matchday.date, birthDate, notAvailableDays, tournament start/end/registration dates) are zoneless `'YYYY-MM-DD'` strings end-to-end — drizzle `date({ mode: "string" })`, never a JS `Date`:
- parse to Luxon: `parseDateOnly(s)` · display: `formatDateOnly(s)` · today: `todayDateOnly()`
- serialize a DateTime: `toDateOnly(dt)` · from a UTC picker date: `utcDateToDateOnly(d)`
- equality/ranges: plain string comparison (`===`, `<`, `<=`)
- react-day-picker: always bind with `timeZone="UTC"` + `TZDate`

**Instants** (createdAt, game start, postponements) are UTC timestamps in the DB, displayed in Berlin:
- `toLocalDateTime(date)` / `getCurrentLocalDateTime()`, format with `formatDate`, `formatLongDate`, `formatEventDateTime`, `formatShortDateOrHoliday`

Naming: `parse*` = string in, `format*` = display out, `to*` = serialize. Never `new Date('YYYY-MM-DD')`, never `toISOString()` on browser-local dates, never date-fns (removed).
