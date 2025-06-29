# Fischer Project Guidelines

## Commands

- `bun run dev` - Start development server (with Turbopack)
- `bun run build` - Build for production
- `bun run lint` - Run linting
- `bun run start` - Start production server

## Code Style

- **Formatting**: Use 2 spaces for indentation, 100 character line width
- **TypeScript**: Strict mode enabled, use type annotations for all variables
- **Imports**: Use path aliases with `@/` prefix (e.g., `import { db } from "@/db/client"`)
- **Components**: Follow React functional component pattern with explicit type props
- **Error Handling**: Use zod for validation, return explicit error objects (see `actions.ts` files)
- **Naming**:
  - camelCase for variables, functions
  - PascalCase for components, types, interfaces
  - kebab-case for filenames
- **Server Components**: Use "use server" directive at top of server action files

## Architecture

- Next.js app router with TypeScript
- Drizzle ORM with NeonDB
- Radix UI components with Tailwind CSS
