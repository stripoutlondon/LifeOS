# Life OS cloud connection

The deployed beta is local-first: it works without an account and stores each profile separately on that device. Its Supabase cloud connection is now configured for optional passwordless accounts and cross-device synchronisation.

The next cloud deployment uses Supabase for:

- passwordless email and Apple sign-in;
- private cross-device backup;
- one account per person;
- invitation-only family spaces;
- shared family principles while journals, health and priorities remain private.

`supabase/schema.sql` contains the tables, row-level security policies, invitation functions and self-service account deletion. The deployed browser client uses the project's public publishable key. Never place a Supabase secret or service-role key in this static application.

The project Site URL must remain `https://golden-sunshine-f5a10b.netlify.app`. Add any future production domain to the authentication redirect allow-list before switching the site URL.
