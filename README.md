# Life OS

A zero-build, mobile-first personal operating system centred on identity, relationships, health, goals and continuous improvement.

The commercial beta includes neutral onboarding, personal or family modes, editable purpose and principles, fully editable morning/daytime/evening routines, optional specialist trackers, user-created daily habits, seven-day insights, private cloud accounts, invitation-only family spaces, separate personal goals/journals/health data, shared family principles, voice input, downloadable profile backup and in-app account deletion.

## Preserved personalised edition

Joe's working Thornton prototype is preserved independently on the `thornton-prototype` branch and at the immutable `thornton-prototype-v1.0` tag. The commercial build lives on `commercial-v1` and uses different browser-storage keys, so testing it cannot overwrite or import the personalised prototype.

## Private beta

The commercial branch is deployed separately at https://life-os-private-beta.netlify.app. See `docs/PRIVATE_BETA.md` for tester setup, cloud readiness and the verified privacy boundaries.

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

Each profile is stored separately in the browser. The commercial edition deliberately does not read or migrate data from the personalised prototype. Connecting cloud synchronisation backs up only the chosen profile to Supabase. A new account must explicitly choose to start fresh or import a local profile. Row-level security limits personal records to that signed-in user. A family space shares only its name and principles.

The secure account and family-space schema is in `supabase/schema.sql`. The browser uses only the project's public publishable key; never commit a secret or service-role key.

## iPhone app

The Capacitor iOS project is under `ios/`, with bundle ID `com.stripoutlondon.lifeos`. Run `npm install` and `npm run native:sync:ios` after changing web assets. Final signing, TestFlight upload and App Store submission require an Apple Developer account and macOS/Xcode or a compatible cloud build service. See `docs/APP_STORE.md`.

