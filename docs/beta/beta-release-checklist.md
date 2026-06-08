# Beta Release Checklist

Use this as the final go/no-go checklist before sending HitList to beta testers.

## Build

- [ ] Expo SDK 56 docs checked for relevant build/config work.
- [ ] Dependencies install cleanly.
- [ ] Expo dependency validation passes.
- [ ] `eas.json` exists.
- [ ] EAS project is configured.
- [ ] iOS credentials are configured.
- [ ] Android credentials are configured.
- [ ] iOS preview build succeeds.
- [ ] Android preview build succeeds.
- [ ] iOS build installs on a physical device.
- [ ] Android build installs on a physical device.

## Auth

- [ ] Sign up works.
- [ ] Sign in works.
- [ ] Sign out works.
- [ ] Session persists after restart.
- [ ] Protected app data is hidden after sign-out.
- [ ] User A cannot see User B data.

## Persistence

- [ ] Supabase schema/migrations are applied.
- [ ] RLS is enabled and verified.
- [ ] Skills persist.
- [ ] Active/inactive state persists.
- [ ] Partners persist.
- [ ] Hits persist.
- [ ] Training logs persist.
- [ ] Notes persist.
- [ ] Media persists.
- [ ] App restart preserves user data.
- [ ] Save failures are visible to the user.

## Core App Flows

- [ ] Create active skill.
- [ ] Create inactive skill.
- [ ] Activate/deactivate skill.
- [ ] Search Arsenal.
- [ ] Filter Arsenal.
- [ ] Sort Arsenal.
- [ ] Quick-log unattributed hit.
- [ ] Quick-log partner hit.
- [ ] Log full training session.
- [ ] Add/remove hit rows.
- [ ] Select partners.
- [ ] Add note.
- [ ] Edit note.
- [ ] Add media.
- [ ] Edit media.
- [ ] Remove media.
- [ ] Open media URL.
- [ ] View Partner Detail.
- [ ] Edit partner name.

## Share Extension

- [ ] iOS share extension appears in share sheet.
- [ ] Android share intent appears.
- [ ] YouTube share works.
- [ ] Instagram share works.
- [ ] Browser URL share works.
- [ ] Plain text URL share works.
- [ ] Multiple URL selection works.
- [ ] Create new skill from shared link works.
- [ ] Add shared link to existing skill works.
- [ ] Metadata failure still allows save.
- [ ] Shared media persists after restart.

## Functional Visual QA

- [ ] First use/auth journey passes on iOS.
- [ ] First use/auth journey passes on Android.
- [ ] Build My Hit List journey passes on iOS.
- [ ] Build My Hit List journey passes on Android.
- [ ] Training Log journey passes on iOS.
- [ ] Training Log journey passes on Android.
- [ ] Skill Detail journey passes on iOS.
- [ ] Skill Detail journey passes on Android.
- [ ] Partners journey passes on iOS.
- [ ] Partners journey passes on Android.
- [ ] Share Intake journey passes on iOS physical device.
- [ ] Share Intake journey passes on Android physical device.

## Store Beta

- [ ] App Store Connect app record exists.
- [ ] TestFlight build uploaded.
- [ ] Internal TestFlight group configured.
- [ ] Google Play app record exists.
- [ ] Google Play internal testing track configured.
- [ ] Android beta artifact uploaded.
- [ ] Tester install instructions prepared.

## Go/No-Go

- [ ] No blocker issues remain.
- [ ] No high-severity issues remain unless explicitly accepted.
- [ ] Known issues list is current.
- [ ] Beta build numbers are recorded.
- [ ] Tester feedback channel is ready.
- [ ] Rollback/rebuild plan is clear.
