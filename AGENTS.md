# AGENTS.md

abap2UI5 Insights: short technical essays about one idea - what happens when
the ABAP server sends the *screen* instead of only the data - published at
https://abap2ui5.github.io/insights/ by GitHub Pages. Written for developers
and architects: the "why it works like this". A standalone site of the
abap2UI5 family - its own repository, build and deployment - and nothing in it
depends on another repository at build time.

The essays lived in the manual (abap2UI5/docs, `docs/advanced/insights/`)
until 2026-10-31. Since then this repository is their source; the manual
keeps a redirect stub for every old address and one sidebar row leading here.

## Layout

| Path | Purpose |
| --- | --- |
| `src/content/essays/NN-slug.md` | One essay per file. Frontmatter: `title` (without the number), `number`, `order` (reading order), `part`, `blurb` (the line in the index), optional `description` (meta) |
| `src/lib/parts.ts` | The six parts (id, title, lead) and the ways in (`PATHS`) |
| `src/pages/index.astro` | The index: opening, the axis figure, the ways in, every essay by part |
| `src/pages/[slug].astro` | An essay, with its part, reading time and previous/next in reading order |
| `src/pages/for/[path].astro` | A way in: the essays it picks, in its order |
| `src/pages/rss.xml.ts` | The feed, in reading order |
| `src/layouts/Page.astro` | The document: head, the Content-Security-Policy, the family's top line, the foot |
| `src/styles/global.css` | The one stylesheet; the family's tokens copied in; light and dark follow the system |
| `public/` | Font (Inter, self-hosted), logo, icons, the essays' SVGs, `use_cases/` |
| `scripts/migrate.mjs` | The one-off import from abap2UI5/docs, kept for the record (see README) |
| `test/site.test.mjs` | `node:test` over the built `dist/` |
| `.github/workflows/pages.yml` | Build + test on every PR; deploy on main |

## Commands

```bash
npm ci
npm run dev      # dev server, http://localhost:4321/insights/
npm run build    # dist/
npm test         # the tests, against dist/ - build first
npm run check    # build + test, what CI runs
```

## Rules

- **A slug is an address.** `NN-slug.md` is published at `/insights/NN-slug/`,
  and abap2UI5/docs redirects every old address
  (`/docs/advanced/insights/NN-slug`) to exactly that. `ADDRESSES` in
  `test/site.test.mjs` lists them; a build that loses one fails. Rename an essay
  only together with its stub in `docs/public/advanced/insights/` of
  abap2UI5/docs, and add the old address there as a stub of its own.
- **`number` is a name, `order` is the place.** Readers say "#21"; the index,
  previous/next and the feed follow `order`, which is the position in reading
  order (#2 reads after #1, #3, #4). A new essay takes the next free number
  and the `order` where it belongs; shift the `order` of the essays after it.
- **A part is data.** Its id is in the frontmatter, its title and lead in
  `src/lib/parts.ts`. A new part is one entry there plus the id in `PART_IDS`.
- **The case for using it is not made here.** Cost, who runs it, what an
  organization keeps, the decision - that is https://abap2ui5.github.io/why/,
  and the third way in leads there. An essay links it, it does not repeat it.
- **Links.** A sister essay: `/insights/NN-slug/`. The manual and every other
  site of the family: absolute (`https://abap2ui5.github.io/docs/...`). No
  VitePress syntax - `{target="_self"}` and `:::` containers render as text
  here; a test holds the first. A diagram goes to `public/` and is referenced
  as `/insights/name.svg`.
- **No script, no inline style.** The policy is `script-src 'self';
  style-src 'self'`: no `<script>`, no `on…=` handler, no `style=""` - the test
  holds every page to it. That is why code is highlighted by Prism (token
  classes the stylesheet colours) and not Shiki (a style attribute per token).
- **Nothing from another origin.** No CDN, no web font service, no analytics.
- **The family's look, copied.** The top line (logo and word leading home, the
  breadcrumb), the colours, Inter and the foot follow `CONVENTION.md` in
  abap2UI5/abap2UI5.github.io, written into `Page.astro` and `global.css` by
  hand; a change to the convention is made there first.
- **No count in prose that goes stale.** The index computes how many essays
  there are; a sentence elsewhere ("thirty-seven essays") is one more place to
  forget. The home page's tile names none for the same reason.
- **Toolchain:** Node 22 (`.nvmrc`, `engines`), astro pinned exactly (7.3.8),
  actions pinned to commits. Deployment needs Settings → Pages → Source:
  "GitHub Actions" once.
