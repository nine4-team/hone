# Android Google Play Beta Release Procedure

Use this procedure for HitList Android beta releases through Google Play testing tracks.

The current website Android beta button points to a self-serve closed testing signup page:

```text
https://hitlist.nine4.co/android-beta
```

That page sends Android users through the required two-step closed testing flow:

1. Join the public Google Group: `https://groups.google.com/g/hitlist-android-beta`
2. Opt in through Google Play: `https://play.google.com/apps/testing/com.nine4.hitlist`

The closed testing track uses `hitlist-android-beta@googlegroups.com` for tester eligibility. Open testing is still blocked until Google grants production access.

## One-Time Play Console Setup

1. Create or confirm the Google Play app record for package `com.nine4.hitlist`.
2. Complete the required Play Console setup:
   - Store listing
   - App content declarations
   - Privacy policy: `https://hitlist.nine4.co/privacy.html`
   - Content rating
   - Pricing and distribution
   - Data safety
3. Configure closed testing for the app with Google Groups tester management.
4. Create a Google Play service account and grant it release access for testing tracks.
5. Make the service account JSON available to EAS submit, preferably through an EAS file secret or a local untracked key file.

Current local setup:

- Service account: `hitlist-play-deploy@n4-1584-design-tools.iam.gserviceaccount.com`
- Play Console access: app-level access for HitList with testing-track release permission
- Local key path: `/Users/benjaminmackenzie/.config/hitlist/google-play-service-account.json`
- EAS submit profile: `android-beta`

Do not commit Google service account keys.

## Normal Closed Testing Release

1. Run checks:

   ```sh
   npm run check
   ```

2. Commit and push the release candidate.

3. Build the Android production app bundle:

   ```sh
   npm run build:production:android
   ```

4. Submit the latest Android build to Google Play testing:

   ```sh
   npm run submit:play:android
   ```

   This uses the `android-beta` EAS submit profile, which targets the Google Play `beta` track once open testing is unlocked. Until then, use Play Console closed testing and the Google Group signup flow.

5. In Play Console, review and roll out the testing release. After the app has production access, open testing can be enabled for a simpler public signup link.

6. Verify the Android beta opt-in link:

   ```text
   https://play.google.com/apps/testing/com.nine4.hitlist
   ```

## First Internal Testing Release

Google Play allows internal testing before the full app listing is complete. Use this when the app is still in Draft and Play rejects open-testing releases with `Precondition check failed`.

```sh
npm run submit:play:android:internal
```

Internal testing is useful for the first Android QA pass. Internal testers must be selected in Play Console and are limited to the internal testing configuration.

Current internal testing setup:

- Track status: active
- Latest release: `1.0.0`
- Tester list: `Friends` with 2 users
- Internal join link: `https://play.google.com/apps/internaltest/4700966242808097011`

## Important Distinctions

- Building an Android app bundle does not make it available to testers.
- Uploading/submitting to Play Console does not make the website link useful until the testing track is active.
- Internal testing links only work for internal testers.
- Closed testing can be self-serve when tester access is controlled by a public Google Group.
- Open testing is the simpler public signup path, but it is unavailable until Google grants production access.

## Current Public Link

- Current Android website signup page: `https://hitlist.nine4.co/android-beta`
- Current Android tester group: `https://groups.google.com/g/hitlist-android-beta`
- Current Android Play opt-in link: `https://play.google.com/apps/testing/com.nine4.hitlist`
- Future Android open testing path: use the Play opt-in link directly after production access unlocks open testing.
- Privacy policy URL for Play Console: `https://hitlist.nine4.co/privacy.html`
