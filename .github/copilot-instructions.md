---
applyTo: "src/**"
---

# Project Overview

This project is a web application that manages a round robin chess tournament. It includes features for user registration, game scheduling, and result tracking.

## Build, Lint, and Test Commands

- **Start dev server:** `bun dev`
- **Build:** `bun run build`
- **Lint:** `bun run lint`
- **Start production:** `bun run start`

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

## General Guideline:

- always check for similar existing code before adding new code, reuse existing code whenever possible and use the same patterns
- always read the schema to understand the data model, do not use optional variables unless necessary
- always use reuseable components from the components folder
- always use reuseable types from the db/types folder
- use the action wrapper to handle errors and loading states
- use toast from sonner to show success and error messages
- use german language for all user facing text
- for database requests, always use repository functions
- keep the repository functions simple by using only one return statement in drizzle syntax
- do not use comments in code, use clear descriptive naming instead
- call props "Props" and use type instead of interface for props
- never keep deprecated code, remove it immediately
- always use "bun run lint" at the end to check for linting errors
- follow the DRY (Don't Repeat Yourself) principle

## Architecture

- Next.js app router (TypeScript)
- Drizzle ORM (NeonDB)
- Radix UI, Tailwind CSS
