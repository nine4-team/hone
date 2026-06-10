# TestFlight Release Procedure

Use this procedure for HitList iOS TestFlight releases. Do not rely on another repo's release process.

## Normal External Testing Release

1. Run checks:

   ```sh
   npm run check
   ```

2. Commit and push the release candidate.

3. Build and upload the iOS production build:

   ```sh
   npm run build:testflight:ios
   ```

   This runs EAS production build with auto-submit. Record the EAS build number from the output.

4. Wait for Apple processing to finish. EAS may say the binary was uploaded successfully while App Store Connect is still processing it.

5. Attach the processed uploaded build to the external TestFlight group:

   ```sh
   npm run testflight:distribute:ios -- <build-number> --groups "External Testing"
   ```

6. Verify the build is externally available:

   ```sh
   ruby scripts/testflight-public-link.rb <build-number> "External Testing"
   ```

   Expected result:

   - `External TestFlight state: BETA_APPROVED` or `IN_BETA_TESTING`
   - `Beta review state: APPROVED`
   - A public TestFlight link is printed

## Important Distinctions

- Uploading a build to App Store Connect does not attach it to external testers.
- The external group step is not a new review submission in the normal release path.
- Do not require `TESTFLIGHT_REVIEW_PHONE` for the normal external-testing flow.
- If Apple explicitly reports that a new Beta App Review submission is required, stop and document the exact App Store Connect state before changing the release procedure.

## Current External Group

- Group name: `External Testing`
- Public link: `https://testflight.apple.com/join/qBgW2Vtg`
