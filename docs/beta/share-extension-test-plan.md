# Share Extension Test Plan

Share intake is beta-critical. HitList must reliably capture technique/media links from outside the app on both iOS and Android.

## Goals

- iOS share extension opens HitList with the shared payload.
- Android share intent opens HitList with the shared payload.
- Shared links can create new skills.
- Shared links can attach media to existing skills.
- Invalid or unsupported payloads fail gracefully.

## Current State

`app.json` configures `expo-sharing`:

- iOS share extension enabled.
- iOS app group: `group.com.benjaminmackenzie.hitlist`.
- iOS extension bundle ID: `com.benjaminmackenzie.hitlist.expo-sharing-extension`.
- iOS activation rule supports text, web URLs, and one web page URL.
- Android share support enabled for `text/*`.

The app includes:

- `app/share-intake.tsx`
- `app/+native-intent.tsx`
- `lib/shareIntake.ts`

## Test Devices

Run the full test set on:

- Physical iPhone.
- Physical Android phone.

Simulator/emulator tests are useful, but real-device tests are required for beta.

## Source Apps To Test

- YouTube
- Instagram
- Mobile browser
- Notes or text editor
- Messages or another plain-text source if convenient

## Payload Cases

Test these payloads:

- YouTube watch URL.
- YouTube short URL.
- YouTube Shorts URL.
- Instagram reel/post URL.
- Generic web URL.
- Plain text with one URL.
- Plain text with multiple URLs.
- Text with tracking parameters.
- URL with trailing punctuation.
- Invalid text with no usable URL.

## User Journeys

### Create New Skill From Shared Link

1. Share a valid media URL into HitList.
2. Confirm Share Intake opens.
3. Confirm preview URL/title appears when available.
4. Add optional note.
5. Enter skill name.
6. Tap Create Skill.
7. Confirm Skill Detail opens.
8. Confirm media appears on the new skill.
9. Restart app and confirm media persists.

### Add Shared Link To Existing Skill

1. Ensure at least one skill exists.
2. Share a valid media URL into HitList.
3. Search/select existing skill.
4. Save.
5. Confirm Skill Detail opens.
6. Confirm media appears under that skill.
7. Restart app and confirm media persists.

### Multiple Link Selection

1. Share text containing multiple valid URLs.
2. Confirm choices appear.
3. Select a non-default link.
4. Save to a new or existing skill.
5. Confirm the selected URL is the one saved.

### Manual Fallback

1. Open Share Intake without a valid payload, or use an invalid payload.
2. Confirm the app provides manual URL entry.
3. Enter a valid URL.
4. Tap Use Link.
5. Save as media.

### Failure Handling

1. Use a valid URL whose metadata cannot be fetched.
2. Confirm saving is still possible.
3. Use an invalid URL.
4. Confirm the error is understandable and does not crash the app.

## Platform-Specific Checks

iOS:

- Share extension appears in the native share sheet.
- Extension opens the main app route correctly.
- App group entitlement is correct.
- Payload is cleared after save.

Android:

- HitList appears for text/URL sharing.
- Intent opens the correct app route.
- Back behavior after share intake is sane.
- Payload is not duplicated on repeated opens.

## Exit Criteria

- All source apps can pass at least one valid URL into HitList.
- Create-new-skill and add-to-existing-skill flows work on both platforms.
- Metadata failure does not block saving.
- Invalid payloads do not crash.
- Shared media persists after restart.
