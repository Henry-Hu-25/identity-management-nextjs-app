# Users Management Widget Implementation

## Problem

The starter application provided WorkOS AuthKit sign-in and a protected account
page, but it did not provide an interface for organization administrators to
manage members. The challenge required adding WorkOS's Users Management widget,
authorizing it securely, and integrating it with the existing application.

## Solution overview

The implementation adds a protected `/users` page backed by a server-only widget
token endpoint. The browser never receives the WorkOS API key. Instead, the
backend uses the authenticated user's verified session to request a short-lived,
organization-scoped token and returns only that limited token to the widget.

```text
Browser opens /users
        |
        v
Next.js verifies the AuthKit session
        |
        v
Client POSTs /api/widget-token
        |
        v
Backend reads user ID and organization ID from the session
        |
        v
Backend requests a widgets:users-table:manage token from WorkOS
        |
        v
Browser passes the token to <UsersManagement />
        |
        v
Widget displays and manages the organization's members
```

## Dependencies

The following packages were added:

- `@workos-inc/widgets` supplies `WorkOsWidgets` and `UsersManagement`.
- `@workos-inc/node` generates widget tokens from server-side code.

## Backend token endpoint

`src/app/api/widget-token/route.ts` exposes `POST /api/widget-token`.

The endpoint:

1. Calls `authkit(request)` to validate and read the AuthKit session.
2. Returns `401` when no authenticated user exists.
3. Returns `400` when the session has no active organization.
4. Reads `WORKOS_API_KEY` only on the server.
5. Requests a token using the session-derived `user.id` and `organizationId`.
6. Limits the token to `widgets:users-table:manage`.
7. Returns `{ token }` with `Cache-Control: no-store`.
8. Returns a safe client-facing error if WorkOS authorization fails.

The user and organization IDs are deliberately not accepted from request data.
Using session-derived values prevents a caller from changing an ID and trying to
manage another organization. Passing `userId` to WorkOS also allows WorkOS to
restrict the requested scope to that user's actual organization permissions.

## Client widget

`src/app/components/users-management-panel.tsx` is a client component because
the widget is interactive and needs to make browser requests.

When mounted, it:

1. Sends a same-origin `POST` request to `/api/widget-token`.
2. Validates both the HTTP response and the returned token type.
3. Displays a loading message while authorization is pending.
4. Displays the backend's safe error message when authorization fails.
5. Provides a retry button that requests a fresh token.
6. Uses `AbortController` to cancel an obsolete request during unmount or React
   development remounts.
7. Renders the authorized widget:

```tsx
<WorkOsWidgets>
  <UsersManagement authToken={token} />
</WorkOsWidgets>
```

Widget and Radix styles are imported globally in `src/app/layout.tsx`.

## Protected page and application integration

`src/app/users/page.tsx` calls:

```ts
await withAuth({ ensureSignedIn: true });
```

This redirects unauthenticated visitors into AuthKit before rendering the page.
The page provides a heading, description, and full-width container for the user
table.

Additional integration changes:

- `src/middleware.ts` now includes `/users/:path*`, so AuthKit validates and
  refreshes the session for the page.
- `src/app/layout.tsx` includes a **Users** navigation link.
- The shared `<main>` uses the available width so the management table is not
  constrained by its parent layout.
- `@workos-inc/widgets/styles.css` is loaded globally.

## Production WorkOS configuration

The production WorkOS application should contain:

- Redirect URI:
  `https://identity-management-nextjs-app-nu.vercel.app/callback`
- Sign-in endpoint:
  `https://identity-management-nextjs-app-nu.vercel.app/login`
- App homepage/sign-out redirect:
  `https://identity-management-nextjs-app-nu.vercel.app`
- Allowed CORS web origin under Sessions:
  `https://identity-management-nextjs-app-nu.vercel.app`

The signed-in user must:

- Belong to an organization.
- Have an active organization in the AuthKit session.
- Have a role containing `widgets:users-table:manage`.

The CORS entry is required because the rendered widget makes browser-side
requests to WorkOS. Redirect configuration and CORS solve different problems:
redirects control browser navigation during authentication, while CORS controls
which web origins may call WorkOS APIs from JavaScript.

## Environment variables

The local `.env.local` file must provide:

```text
WORKOS_CLIENT_ID=...
WORKOS_API_KEY=...
WORKOS_COOKIE_PASSWORD=...
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
```

`WORKOS_COOKIE_PASSWORD` must contain at least 32 characters. Neither it nor the
API key should be committed. Only the redirect URI is intentionally exposed to
browser/edge code through the `NEXT_PUBLIC_` prefix.

## Verification performed

End-to-end verification confirms that an authorized organization admin can:

- View organization members.
- Invite a user.
- Change a member's role.
- Remove or revoke a member.
- Reload the page without CORS errors.
