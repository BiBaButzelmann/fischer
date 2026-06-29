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
