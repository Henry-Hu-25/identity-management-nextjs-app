# Agent Guide: WorkOS SE Interview App

## What this project is

Next.js (App Router) take-home for WorkOS Solutions Engineering candidates. The starter app already implements AuthKit sign-in/sign-out and a basic account page. The challenge is to add the **WorkOS Users Management widget** so org admins can invite, remove, and manage members.

## Stack

- **Next.js 15** + React 18 + TypeScript
- **`@workos-inc/authkit-nextjs`** — AuthKit session middleware, `withAuth`, login/callback helpers
- **Radix UI Themes** — UI primitives and layout
- Env config via `.env.local` (see `.env.local.example`)

## Key paths

| Path | Role |
|------|------|
| `src/middleware.ts` | AuthKit middleware for `/`, `/account`, `/api` |
| `src/app/layout.tsx` | Root layout, `AuthKitProvider`, nav |
| `src/app/page.tsx` | Home (signed-in vs signed-out) |
| `src/app/login/route.ts` | Redirects to WorkOS sign-in URL |
| `src/app/callback/route.ts` | OAuth/AuthKit callback (`handleAuth`) |
| `src/app/account/page.tsx` | Protected account details (`ensureSignedIn`) |
| `src/app/actions/signOut.ts` | Server action for sign-out |
| `src/app/api/get-name/route.ts` | Example authenticated API route |
| `src/app/components/` | `SignInButton`, `Footer` |

## Auth flow (existing)

1. User hits `/login` → `getSignInUrl()` → WorkOS hosted AuthKit
2. WorkOS redirects to `/callback` → `handleAuth()` establishes session cookie
3. Pages use `withAuth()` / `useAuth()`; middleware refreshes/validates session
4. Sign-out via server action calling `signOut()`

## Challenge task (to implement)

1. Install WorkOS Widgets dependencies
2. Add a page/component using the `UsersManagement` widget
3. Generate a **widget token on the backend** (do not expose API keys client-side)
4. Wire it into the existing AuthKit session / org context

Docs: [User Management Widget](https://workos.com/docs/user-management/widgets/user-management)

## Local setup

```bash
cp .env.local.example .env.local
# Fill WORKOS_CLIENT_ID, WORKOS_API_KEY, WORKOS_COOKIE_PASSWORD (≥32 chars)
# NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
npm install
npm run dev
```

Dashboard: redirect URI `http://localhost:3000/callback`, homepage `http://localhost:3000`.

## Conventions for agents

- Prefer extending existing AuthKit patterns (`withAuth`, route handlers, server actions) over inventing a parallel auth layer
- Keep secrets in server-only code / env vars
- Match existing Radix Themes styling and App Router file layout
- Do not commit `.env.local` or secrets
- Working branch for this session: `WorkingBranch`
