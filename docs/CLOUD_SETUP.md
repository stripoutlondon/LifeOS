# Life OS cloud connection

The deployed beta is deliberately local-first: it works without an account and stores each profile separately on that device.

The next cloud deployment uses Supabase for:

- passwordless email and Apple sign-in;
- private cross-device backup;
- one account per person;
- invitation-only family spaces;
- shared family principles while journals, health and priorities remain private.

`supabase/schema.sql` contains the initial tables and row-level security policies. A Supabase project URL and public anonymous key are still required before the browser client can be connected. Never place a Supabase service-role key in this static application.
