# Nunnykirk Parish Council website

Static website for Nunnykirk Parish Council, built with [Astro](https://astro.build/),
authored in Markdown, edited through a friendly form editor
([Decap CMS](https://decapcms.org/)) at `/admin/`, and deployed automatically to
**GitHub Pages**.

## Everyday updating — no coding needed

Almost everything can be changed from the browser editor. Go to
**https://nunnykirkpc.org.uk/admin/** and sign in with GitHub. You'll see:

| Section in the editor | What it controls |
| --- | --- |
| **Meetings** | Meeting dates, and the **agenda** and **minutes** PDFs for each meeting. Add a meeting, set the date, upload the agenda; after the meeting upload the approved minutes. |
| **Documents** | Policies, financial documents and public notices. Add an entry, pick a category, upload the PDF. |
| **Councillors** | The people shown on the *People* page (name, role, order, optional email/photo). |
| **Pages** | The Home page introduction and the History page text. |
| **Site settings** | Site title, tagline, the navigation menu, and the **Clerk's contact details** (name, email, phone, address, office hours). |

**Uploading a file** (agenda, minutes, or a document): in the relevant field click the
file/upload button, choose the PDF, and save. The file is stored in `public/uploads/`
and linked automatically — you never edit HTML.

Saving in the editor opens a *pull request*; once it's merged (or approved), GitHub
rebuilds and republishes the site within a couple of minutes.

> **⚠️ Before go-live — confirm the placeholders.** The Clerk's email
> (`clerk@nunnykirkpc.gov.uk`) and phone (`01670 000000`) in **Site settings** are
> placeholders carried over from the old site, which listed conflicting values. Set
> the correct ones. Also delete the two **EXAMPLE** meetings, the **EXAMPLE** document,
> and the placeholder `public/uploads/example.pdf` once real content is in.

## Editing the files directly (alternative to the editor)

Every piece of content is a small text file you can also edit on github.com:

| What | Where |
| --- | --- |
| Councillors | `src/content/councillors/*.md` (one file per person) |
| Meetings | `src/content/meetings/*.md` (one file per meeting) |
| Documents | `src/content/documents/*.md` (one file per document) |
| Home intro / History | `src/content/pages/home.md`, `src/content/pages/history.md` |
| Contact details, title, nav | `src/config/site.json` |
| Uploaded PDFs / images | `public/uploads/` |
| Colours & fonts | `src/styles/global.css` |

A meeting file looks like this:

```markdown
---
title: Ordinary Meeting of the Council
date: 2026-09-16T19:00:00
location: Nunnykirk
agenda: /uploads/2026-09-agenda.pdf   # optional
minutes: /uploads/2026-09-minutes.pdf # optional, added later
draft: false
---

Optional notes about the meeting.
```

## Local development

Requirements: Node 20+ (see `.nvmrc`).

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # production build to ./dist
npm run preview  # preview the production build
```

To try the `/admin/` editor locally without GitHub sign-in, run `npx decap-server` in a
second terminal and temporarily add `local_backend: true` to `public/admin/config.yml`.

## Deployment

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.

### One-time GitHub Pages setup

1. Create the repo on GitHub (e.g. `christait/nunnykirkpc`) and push this project.
2. Repo **Settings → Pages → Build and deployment → Source**: choose **GitHub Actions**.
3. The `public/CNAME` file sets the custom domain `nunnykirkpc.org.uk` automatically.

### DNS (moving the domain to GitHub Pages, off the current host)

At your DNS provider for `nunnykirkpc.org.uk`, point the domain at GitHub Pages:

- Apex `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- (and/or `AAAA` records → `2606:50c0:8000::153`, `…8001::153`, `…8002::153`, `…8003::153`)
- `www` `CNAME` → `christait.github.io`

Then tick **Enforce HTTPS** in Settings → Pages once the certificate is issued.

## CMS sign-in setup (one-time, for the `/admin/` editor)

Decap signs editors in through GitHub, brokered by a tiny OAuth worker. Deploy one on
**Cloudflare Workers** (free tier — used *only* for sign-in, not for hosting the site):

1. Deploy [`decap-proxy`](https://github.com/sterlingwes/decap-proxy) as a Cloudflare
   Worker. Note its URL, e.g. `https://nunnykirk-oauth.<you>.workers.dev`.
2. In **GitHub → Settings → Developer settings → OAuth Apps**, create an app:
   - Homepage URL: `https://nunnykirkpc.org.uk`
   - Authorization callback URL: `https://<your-worker-host>/callback`
3. Put the resulting **Client ID** and **Client Secret** into the Worker's environment
   variables.
4. Edit `public/admin/config.yml` and set:
   ```yaml
   backend:
     name: github
     repo: christait/nunnykirkpc   # confirm owner/repo
     branch: main
     base_url: https://<your-worker-host>
     auth_endpoint: auth
   ```

Until this is done, the site itself works fully; only the `/admin/` editor sign-in is
inactive (you can still edit files directly on GitHub).

## Project layout

```
.
├── astro.config.mjs
├── public/
│   ├── admin/            # Decap CMS editor (index.html + config.yml)
│   ├── uploads/          # uploaded PDFs & images
│   ├── CNAME             # custom domain
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/       # Header, Footer
│   ├── config/site.json  # title, tagline, nav, contact details
│   ├── content/          # councillors, meetings, documents, pages (Markdown)
│   ├── layouts/          # BaseLayout, MarkdownPageLayout
│   ├── pages/            # Home, Meetings, Documents, People, History, Contact, 404
│   └── styles/global.css
└── .github/workflows/    # build + deploy to GitHub Pages
```

## Licence

Content © Nunnykirk Parish Council. Source code MIT-licensed.
