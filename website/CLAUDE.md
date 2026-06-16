# HitList marketing site

## Files

- `index.html` — the live landing page. Single file, inline `<style>`, no build step.
- `android-beta.html` — Android tester self-serve signup flow.
- `privacy.html` — privacy policy used by Google Play.
- `images/` — screenshots and logos referenced by the page.
- `brand/` — logo source (`reticle-logo.svg`). Not used directly by the page.

## Deployment

The live site is a **Cloudflare Worker** serving static assets — not a Cloudflare Pages project.

- **URL:** https://hitlist.nine4.co
- **Account:** Nine4 (`team@nine4.co`, account id `7eb7c71ac9cdb0f54bd70966f07a9878`)
- **Worker name:** `hitlist`

### Why a Worker, not Pages

The Workers custom-domain flow creates the DNS record itself during `wrangler deploy`, authorized by the `workers_routes:write` scope that `wrangler login` already grants. The Pages path leaves DNS as a separate step that needs a `DNS:Edit` permission wrangler's OAuth login does **not** carry — so a Pages deploy can't fully wire the domain without a separate API token or a dashboard click. Workers avoids that entirely.

### How to deploy

Workers serves every file in the assets directory, so don't point it at this dir directly (it would publish `CLAUDE.md` and `brand/`). Stage a clean publish dir with just the public HTML files + `images/`:

1. Copy `index.html`, `android-beta.html`, `privacy.html`, and `images/` into a staging dir.
2. Add a `wrangler.jsonc` in that staging dir:
   ```jsonc
   {
     "name": "hitlist",
     "compatibility_date": "2026-06-07",
     "assets": { "directory": "." },
     "routes": [{ "pattern": "hitlist.nine4.co", "custom_domain": true }]
   }
   ```
3. `CLOUDFLARE_ACCOUNT_ID=7eb7c71ac9cdb0f54bd70966f07a9878 wrangler deploy`

The `CLOUDFLARE_ACCOUNT_ID` export matters — wrangler may otherwise target a different account it has cached.
