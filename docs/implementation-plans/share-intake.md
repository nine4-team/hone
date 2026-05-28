# Share Intake Implementation Plan

Product note: this plan predates the HitList rename and the Arsenal/Equipped Skills redesign. Use [HONE_APP_SPEC.md](../../HONE_APP_SPEC.md) as the source of truth for current naming and skill state.

## Goal

Let users share a link from another app into HitList, then either create a new skill with that link attached or add the link as media to an existing skill.

This plan follows the current MVP product constraint in `HONE_APP_SPEC.md`: media is link-only, and titles/thumbnails are fetched metadata rather than required user input.

## Expo Compatibility Notes

Implementation should use Expo SDK 56 behavior documented in the versioned Expo docs:

- `expo-sharing` supports receiving shared content from other apps, including text, URLs, and files.
- Receiving shares is documented as experimental.
- iOS share receiving opens the main app from the share extension path. Expo documents this caveat, so this feature must be verified on real iOS builds before it is treated as stable.
- Native share registration requires a development build or production build. Expo Go is not enough for end-to-end verification.

Reference: https://docs.expo.dev/versions/v56.0.0/sdk/sharing/

## Product Scope

In scope:

- Receive shared text or URL payloads from iOS and Android.
- Extract URLs from shared text.
- Normalize common URL shapes.
- Classify media as `youtube`, `instagram`, or `link`.
- Confirm before saving.
- Create a new skill with initial media.
- Add shared media to an existing skill.
- Save optional media notes.
- Allow manual correction when extraction fails.

Out of scope for this pass:

- Direct video/image/file uploads.
- Downloading source media.
- Account-authenticated metadata scraping.
- Automatic skill creation without user confirmation.
- Duplicate-detection enforcement beyond a simple warning if cheap.
- Background processing from the native share extension without opening the app.

## UX Flow

### Successful Share

1. User taps Share in YouTube, Instagram, Patreon, Safari, or another app.
2. User chooses HitList from the OS share sheet.
3. HitList opens to a Share Intake screen.
4. Screen shows:
   - source/provider guess
   - normalized URL
   - fetched title/thumbnail if available
   - optional note field
   - Create New Skill action
   - Add To Existing Skill action
5. User chooses one path.
6. HitList saves the media and routes to the affected Skill Detail screen.

### Multiple URLs

If shared text contains multiple URLs, show a URL picker before the create/add decision. Do not silently choose.

### Invalid Or Unsupported Share

If no usable URL is found, show a manual URL field with the original text available for reference. The user can paste or edit a URL, or cancel.

## Data Rules

Use the existing `Media` model:

```text
Media
- id
- skill_id
- type
- url
- title nullable
- thumbnail_url nullable
- notes nullable
- created_at
- updated_at
```

For new skills:

- Require a skill name before save.
- Default equipped to `false`.
- Attach media in the same user action.
- Route to `/skills/[id]` after save.

For existing skills:

- Add one Media row to the selected skill.
- Touch/update the skill the same way manual media add does.
- Route to `/skills/[id]` after save.

## Normalization Rules

Add a dedicated module, likely `lib/shareIntake.ts` or `lib/mediaUrl.ts`.

The module should expose pure functions so it can be tested without native share plumbing:

- `extractUrls(input: string): string[]`
- `normalizeSharedUrl(url: string): NormalizedSharedUrl`
- `normalizeSharedPayload(payload): NormalizedShareResult`

Initial normalization behavior:

- Trim whitespace and surrounding punctuation.
- Add `https://` only when the string looks like a bare domain.
- Remove common tracking params such as `utm_*`, `fbclid`, `gclid`, `igsh`, and similar share noise.
- Normalize YouTube short links:
  - `youtu.be/{id}` -> stable YouTube watch URL if the video id is present.
  - preserve useful timestamp params when practical.
- Keep Instagram and Patreon URLs as canonical HTTPS URLs without tracking params.
- Preserve the original URL in the normalized result for diagnostics and future duplicate handling.

Classification should keep using or extend the existing `inferMediaType()` behavior in `lib/mediaMetadata.ts`.

## Technical Steps

1. Install `expo-sharing`.
2. Configure the `expo-sharing` plugin in `app.json`:
   - iOS enabled with text/web URL activation rules.
   - Android enabled for `text/*`.
3. Add `app/+native-intent.ts` for Expo Router incoming native intent handling.
4. Route incoming share URLs to `/share-intake`.
5. Add a Share Intake screen at `app/share-intake.tsx`.
6. Add share normalization helpers.
7. Add store helper for create-skill-with-media:
   - either a dedicated `addSkillWithMedia()` action
   - or careful sequencing through existing `addSkill()` then `addMedia()`
8. Extend the new skill screen only if it becomes the cleanest way to reuse existing create UI.
9. Add focused tests or test fixtures for URL extraction and normalization.
10. Verify on device builds for both platforms.

## Suggested App Config Shape

Exact config should be checked against the installed `expo-sharing` SDK 56 package before implementation, but expected shape is:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      [
        "expo-sharing",
        {
          "ios": {
            "enabled": true,
            "activationRule": {
              "supportsText": true,
              "supportsWebUrlWithMaxCount": 1,
              "supportsWebPageWithMaxCount": 1
            }
          },
          "android": {
            "enabled": true,
            "singleShareMimeTypes": ["text/*"]
          }
        }
      ]
    ]
  }
}
```

## Test Matrix

Manual verification should include:

- iOS YouTube app sharing a video.
- Android YouTube app sharing a video.
- iOS Safari sharing a YouTube page.
- Android browser sharing a YouTube page.
- Instagram app sharing a reel/post link on both platforms.
- Patreon app or browser sharing a post link on both platforms.
- Shared plain text containing one URL.
- Shared plain text containing multiple URLs.
- Shared plain text with no URL.
- Malformed URL edited manually into a valid URL.

Automated/pure test fixtures should include:

- `https://youtu.be/{id}?si=...`
- `https://www.youtube.com/watch?v={id}&utm_source=...`
- `https://m.youtube.com/watch?v={id}`
- `https://www.instagram.com/reel/{id}/?igsh=...`
- `https://www.patreon.com/posts/{slug}-{id}?utm_campaign=...`
- Text before and after a URL.
- Multiple URLs in one text payload.

## Open Questions

- Should the Share Intake screen live outside the tab layout as a modal, or inside the standard app chrome?
- Should metadata title be offered as a one-tap skill-name suggestion?
- Should duplicates show a warning when the normalized URL already exists on any skill?
- Should existing-skill selection prioritize equipped skills, recently touched skills, or search-first?
- Should Patreon get a first-class media type later, or remain `link` for MVP?

## Rollout Notes

Because Expo marks receiving shares as experimental, the first implementation should be treated as a device-tested MVP feature. Keep the pure normalization code isolated so that if Expo share plumbing changes, the URL handling and product flow remain reusable.
