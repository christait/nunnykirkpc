# GitHub OAuth broker (Cloudflare Worker)

This small Worker lets the `/admin/` editor sign in with GitHub. It is used **only
for login** — it does not host the site or manage DNS. `worker.js` is the whole thing.

## One-time setup

### 1. Create a GitHub OAuth App
GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**:
- **Application name:** `Nunnykirk PC editor`
- **Homepage URL:** `https://nunnykirkpc.org.uk`
- **Authorization callback URL:** `https://<your-worker-host>/callback`
  (you'll know the exact worker host after step 2 — you can edit this field afterwards)

Click **Register**, then **Generate a new client secret**. Keep the **Client ID** and
**Client secret**.

### 2. Deploy the Worker — pick ONE method

**A) Cloudflare dashboard (no tools):** Cloudflare → **Workers & Pages → Create →
Create Worker**. Name it `nunnykirk-oauth`. Click **Edit code**, delete the sample,
paste the contents of `worker.js`, then **Deploy**. Note its URL, e.g.
`https://nunnykirk-oauth.<account>.workers.dev`. Then add the two variables under
**Settings → Variables and Secrets**:
- `OAUTH_CLIENT_ID` — the Client ID from step 1
- `OAUTH_CLIENT_SECRET` — the Client secret (tick **Encrypt**)

**B) Wrangler CLI (uses `wrangler.toml` in this folder):**
```bash
cd oauth-worker
npx wrangler login
npx wrangler deploy                            # prints the Worker URL
npx wrangler secret put OAUTH_CLIENT_ID        # paste Client ID
npx wrangler secret put OAUTH_CLIENT_SECRET    # paste Client secret
```

Then go back to the GitHub OAuth App and make sure the callback URL is
`https://<your-worker-host>/callback`.

### 4. Point the CMS at the Worker
In `public/admin/config.yml`, set `base_url` to the Worker URL:
```yaml
backend:
  name: github
  repo: christait/nunnykirkpc
  branch: main
  base_url: https://nunnykirk-oauth.<account>.workers.dev
  auth_endpoint: auth
```
Commit and push. After the site rebuilds, editors can sign in at
`https://nunnykirkpc.org.uk/admin/`.
