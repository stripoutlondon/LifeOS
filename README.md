# Life OS

A zero-build, mobile-first personal operating system centred on identity, family, health, goals and continuous improvement.

The current beta includes personal onboarding, private cloud accounts, invitation-only family spaces, separate personal goals/journals/health data, shared family principles, voice input, downloadable profile backup and in-app account deletion.

## Run locally

Serve the folder with any static server, for example:

```text
npx serve .
```

No dependency installation or build step is required for the hosted web app.

## Netlify

- Build command: leave blank
- Publish directory: `.`

The included `netlify.toml` applies these settings automatically.

## Data

Each profile is stored separately in the browser. Existing `life-os-v1` data is automatically migrated into Joe's private profile. Connecting cloud synchronisation backs up the active profile to Supabase. Row-level security limits personal records to that signed-in user. A family space shares only its name and principles.

The secure account and family-space schema is in `supabase/schema.sql`. The browser uses only the project's public publishable key; never commit a secret or service-role key.

## iPhone app

The Capacitor iOS project is under `ios/`, with bundle ID `com.stripoutlondon.lifeos`. Run `npm install` and `npm run native:sync:ios` after changing web assets. Final signing, TestFlight upload and App Store submission require an Apple Developer account and macOS/Xcode or a compatible cloud build service. See `docs/APP_STORE.md`.

