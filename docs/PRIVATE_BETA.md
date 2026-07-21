# Life OS private beta

## Live environments

- Personalised Thornton prototype: https://golden-sunshine-f5a10b.netlify.app
- Commercial private beta: https://life-os-private-beta.netlify.app
- Commercial source branch: `commercial-v1`

The two sites use separate browser-storage namespaces. The commercial beta does not read or migrate the personalised prototype's local data.

## Tester setup

1. Open the commercial beta URL.
2. Create a personal, family, or combined Life OS.
3. Choose a starter direction, then edit routines, principles, habits, goals and prompts from the profile page.
4. Use the app locally immediately, or connect an email account for cloud backup and cross-device access.
5. A family owner can create a family space and share its invitation code. Family principles are shared; goals, routines, habits, health entries and journals remain private.

## Cloud readiness

The Supabase schema was upgraded on 21 July 2026 with backward-compatible columns for Way names, personal/family modes, editable routine configuration and tracker preferences. The beta URL is included in the authentication redirect allow list.

Privacy verification completed:

- Row-level security is enabled on `profiles`, `life_data`, `family_spaces`, `family_members` and `family_invites`.
- `profiles` and `life_data` are restricted to the authenticated owner.
- Family spaces and memberships are restricted to family members.
- Family creation, joining and account deletion functions are executable only by authenticated users.
- The anonymous role has no privileges on the five Life OS tables.

## Current beta limitation

The beta URL is unlisted but not password-protected. Share it only with intended testers. Email sign-in and real two-account family testing still require testers to use their own email inboxes.

