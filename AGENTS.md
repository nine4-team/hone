# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# TestFlight release process

When asked to deploy HitList to TestFlight, follow this repo's own release procedure in `docs/beta/testflight-release.md`.

Important: uploading a build to App Store Connect is not the same as making it available to external testers. After the upload finishes and Apple processes the build, attach the uploaded build to the `External Testing` group with:

```sh
npm run testflight:distribute:ios -- <build-number> --groups "External Testing"
```

Do not require `TESTFLIGHT_REVIEW_PHONE` for the normal external-testing flow. This app has already passed Beta App Review; the normal task is to attach the uploaded build to the external testing group.
