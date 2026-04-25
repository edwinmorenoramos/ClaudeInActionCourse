# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup          # First-time setup: install deps, generate Prisma client, run migrations
npm run dev            # Start dev server with Turbopack
npm run build          # Production build
npm run lint           # ESLint check
npm run test           # Run all Vitest tests
npm run test -- path/to/file.test.ts  # Run a single test file
npm run db:reset       # Reset and re-migrate the database
```

Set `ANTHROPIC_API_KEY` in `.env.local` to enable real Claude responses; without it, a mock provider is used automatically.

## Architecture

UIGen is an AI-powered React component IDE. Users describe what they want in a chat, and Claude generates/edits React components with a live preview.

### Three-panel layout

The main UI (`src/components/main-content.tsx`) is a resizable split view:
- **Left panel** — Chat interface (`src/components/chat/`)
- **Right panel** — toggles between two views:
  - **Preview**: iframe sandbox running the generated code
  - **Code**: file tree + Monaco editor side-by-side

### Virtual file system

There is no real disk I/O for user files. Everything lives in an in-memory tree (`src/lib/file-system.ts`) managed via React context (`src/lib/contexts/file-system-context.tsx`). Projects are serialized to JSON and persisted in SQLite (Prisma) for authenticated users; anonymous users get session-only state.

### AI integration

Chat messages hit `POST /api/chat` (`src/app/api/chat/route.ts`), which streams Claude responses via Vercel AI SDK. The model is `claude-haiku-4-5` (defined in `src/lib/provider.ts`). Claude is given two tools:
- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — `create`, `str_replace`, and `insert` commands
- `file_manager` (`src/lib/tools/file-manager.ts`) — `rename` and `delete` commands

Tool calls are intercepted **client-side** in `FileSystemProvider.handleToolCall` (`src/lib/contexts/file-system-context.tsx`) via the Vercel AI SDK's `onToolCall` callback — the server only streams them, the client applies them to the in-memory VFS and triggers a re-render via `refreshTrigger`.

System prompts live in `src/lib/prompts/`.

### Live preview pipeline

`src/lib/transform/jsx-transformer.ts` takes the virtual file system snapshot and:
1. Compiles JSX to JS at runtime using Babel standalone
2. Generates an import map for module resolution
3. Injects the result into the iframe (`src/components/preview/PreviewFrame.tsx`)

The preview entry point is `/App.jsx` — `FileSystemProvider` auto-selects it if it exists; otherwise it falls back to the first root-level file. CSS imports are stripped before Babel compilation; missing local imports get placeholder modules so the preview doesn't crash.

### Auth & data

- JWT sessions stored in HTTP-only cookies (`src/lib/auth.ts`)
- `src/middleware.ts` protects API routes
- Server actions in `src/actions/` handle auth (signUp/signIn/signOut) and CRUD for projects
- Database: SQLite via Prisma; schema at `prisma/schema.prisma` (User ↔ Project)
- Prisma client is generated to `src/generated/prisma` (not the default location)
- Anonymous users' in-progress work (messages + file system) is saved to `sessionStorage` via `src/lib/anon-work-tracker.ts` and can be migrated into a new project on sign-in

### Path alias

`@/*` maps to `src/*` throughout the codebase.

## Database

`prisma/schema.prisma` is the source of truth for the database structure. Reference it whenever working with anything database-related.

## Code Style

Each logic block must have a short comment above it explaining what it does.
