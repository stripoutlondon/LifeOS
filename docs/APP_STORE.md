# Life OS App Store handoff

## Already prepared

- Native iOS wrapper generated with Capacitor.
- Bundle identifier: `com.stripoutlondon.lifeos`.
- Web assets copied into the native project by `npm run native:sync:ios`.
- Native haptic feedback and local-notification plugin foundations.
- Privacy and support pages hosted with the web beta.
- Passwordless accounts, private cloud synchronisation, family spaces and in-app account deletion.

## Required before TestFlight

1. Enrol the publishing person or company in the Apple Developer Program.
2. Confirm the public product name, seller/legal entity and support contact.
3. Open `ios/App/App.xcodeproj` on a Mac with current Xcode, select the Apple development team and confirm automatic signing.
4. Replace the temporary app icon set with final 1024px artwork and verify all required icon renditions.
5. Add the `NSMicrophoneUsageDescription` text before enabling native microphone capture. Browser speech input and Apple keyboard dictation do not require a custom native audio recorder.
6. Create the Life OS record in App Store Connect using bundle ID `com.stripoutlondon.lifeos`.
7. Supply the hosted privacy URL and support URL, screenshots, description, age rating and App Privacy answers.
8. Archive the app, upload it to App Store Connect and invite internal testers through TestFlight.
9. Test sign-in, synchronisation, family invitation, offline/local behaviour and account deletion on a physical iPhone.

## Before public submission

- Replace the Netlify beta URL with the final branded domain and update the Supabase Site URL/redirect allow-list.
- Publish final legal wording reviewed for the operating company and launch territories.
- Add a dependable private support channel rather than relying solely on GitHub issues.
- Decide whether launch is free or subscription-based. If subscriptions are added, implement Apple in-app purchase and restore-purchases flows before review.
- Complete accessibility and data-retention testing.
