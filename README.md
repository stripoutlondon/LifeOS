# Life OS

A zero-build, mobile-first personal operating system centred on identity, family, health, goals and continuous improvement.

The current beta includes personal onboarding, separate local profiles, editable purpose and family principles, voice input, invitations and downloadable profile backup.

## Run locally

Serve the folder with any static server, for example:

```text
npx serve .
```

No dependency installation or build step is required.

## Netlify

- Build command: leave blank
- Publish directory: `.`

The included `netlify.toml` applies these settings automatically.

## Data

Each profile is stored separately in the browser. Existing `life-os-v1` data is automatically migrated into Joe's private profile.

The secure account and family-space schema is in `supabase/schema.sql`. See `docs/CLOUD_SETUP.md` for the remaining external setup required for sign-in and cross-device sync.

