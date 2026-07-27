# Agent Guide: WorkOS Identity Management App

## Project status

This Next.js App Router take-home now implements the WorkOS `UsersManagement`
widget. Authenticated organization admins can view members, send invitations,
change roles, and remove access from the protected `/users` page.

## Stack

- Next.js 15, React 18, TypeScript
- `@workos-inc/authkit-nextjs` for login, sessions, and route protection
- `@workos-inc/widgets` and TanStack Query for the embedded management UI
- `@workos-inc/node@7.82.0` for server-side widget token generation
- Radix UI Themes for layout and styling

## Important paths

| Path | Responsibility |
| --- | --- |
| `src/middleware.ts` | Runs AuthKit on `/`, `/account`, `/users`, and `/api` |
| `src/app/layout.tsx` | Providers, global widget CSS, navigation, shared layout |
| `src/app/users/page.tsx` | Protected server-rendered Users page |
| `src/app/components/users-management-panel.tsx` | Client token fetch, states, widget |
| `src/app/api/widget-token/route.ts` | Authenticated, org-scoped token endpoint |
| `src/app/login/route.ts` | Starts hosted AuthKit login |
| `src/app/callback/route.ts` | Completes login and establishes the session |
| `implementation.md` | Detailed implementation and security explanation |

## Widget authorization flow

1. `/users` requires a valid AuthKit session.
2. The client posts to `/api/widget-token`.
3. The backend reads `user.id` and `organizationId` from the verified session.
4. The backend uses `WORKOS_API_KEY` to request a short-lived token scoped to
   `widgets:users-table:manage`.
5. Only that limited token is passed to `UsersManagement`; the API key remains
   server-side.

## Required local and dashboard configuration

`.env.local` must define `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`,
`WORKOS_COOKIE_PASSWORD` (at least 32 characters), and
`NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback`.

In the WorkOS Sandbox dashboard configure:

- Redirect URI: `http://localhost:3000/callback`
- Sign-in endpoint: `http://localhost:3000/login`
- App homepage/sign-out redirect: `http://localhost:3000`
- Sessions CORS origin: `http://localhost:3000`
- User organization role permission: `widgets:users-table:manage`

Run with `npm install` followed by `npm run dev`.

## Agent conventions

- Derive user and organization identity from AuthKit sessions, never client input.
- Keep API keys and cookie secrets in server-only environment variables.
- Do not cache widget-token responses or commit `.env.local`.
- Preserve the pinned WorkOS Node SDK unless compatibility is revalidated.
- Match existing App Router and Radix patterns; verify with `npx tsc --noEmit`
  and `npm run build`.
- Current working branch: `WorkingBranch`.
