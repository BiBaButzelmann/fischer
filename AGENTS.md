# AGENTS.md

## Build, Lint, and Test Commands

- **Start dev server:** `bun run dev`
- **Build:** `bun run build`
- **Lint:** `bun run lint`
- **Start production:** `bun run start`
- **Run a single test:** (No test script found; add if needed)

## Code Style Guidelines

- **Formatting:** 2 spaces, 100 character line width
- **TypeScript:** Strict mode, type annotations for all variables
- **Imports:** Use `@/` path alias (e.g., `import { db } from "@/db/client"`)
- **Components:** React functional components, explicit type props
- **Error Handling:** Use zod for validation, return explicit error objects (see `actions.ts`)
- **Naming:**
  - camelCase for variables/functions
  - PascalCase for components/types/interfaces
  - kebab-case for filenames
- **Server Actions:** Use `"use server"` at top of server action files

## Architecture

- Next.js app router (TypeScript)
- Drizzle ORM (NeonDB)
- Radix UI, Tailwind CSS

_No Cursor or Copilot rules found._
