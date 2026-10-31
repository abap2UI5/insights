# abap2UI5 Insights

Thirty-seven short essays about one idea: what happens when the ABAP server
sends the *screen* instead of only the data. Why the framework exists, how it
works under the app, what a working day with it looks like, and where it
belongs next to what SAP ships - with three ways in, for developers,
architects and decision makers.

**→ https://abap2ui5.github.io/insights/**

One of the abap2UI5 family of sites, next to the
[documentation](https://abap2ui5.github.io/docs/), the
[playground](https://abap2ui5.github.io/playground/) and the
[page for decision makers](https://abap2ui5.github.io/why/): its own
repository, build and deployment, nothing shared but the convention
(`CONVENTION.md` in abap2UI5/abap2UI5.github.io). Built with
[Astro](https://astro.build) into static pages without a script.

## Run it

```bash
npm ci
npm run dev       # http://localhost:4321/insights/
npm run check     # build + tests, what CI runs
```

## Where things are

| | |
|---|---|
| `src/content/essays/NN-slug.md` | the essays - one file each, the frontmatter carries title, number, part and the one-line blurb |
| `src/lib/parts.ts` | the four parts and the three reading paths, in one place |
| `src/pages/index.astro` | the index |
| `src/pages/[slug].astro` | an essay, with previous/next |
| `src/pages/for/[path].astro` | a reading path |
| `src/pages/rss.xml.ts` | the feed |
| `src/layouts/Page.astro` | the document around every page: the family's top line, the policy, the foot |
| `src/styles/global.css` | the one stylesheet, the family's tokens copied in |
| `scripts/migrate.mjs` | brought the essays over from abap2UI5/docs; see below |
| `migration/` | what the docs repository has to do on its side |
| `test/site.test.mjs` | what the built site must keep |

## Adding an essay

Create `src/content/essays/38-the-slug.md`:

```md
---
title: "The Title, Without the Number"
number: 38
part: where          # why | how | day | where
description: "one line, lower case, no period - the blurb in the index"
---

The text. Links to a sister essay are `/insights/05-ui5-over-the-wire/`,
links to the manual are absolute (`https://abap2ui5.github.io/docs/...`),
a diagram goes to `public/` and is referenced as `/insights/38-name.svg`.
```

The index, the feed, the previous/next links and the part boundaries follow
from `number` and `part`. To put it on a reading path, add the number in
`src/lib/parts.ts`. `npm run check` tells you if a link points nowhere.

## No script, no inline style

Every page carries a Content-Security-Policy of `script-src 'self';
style-src 'self'`, and `npm test` fails a build that contains a `<script>`
or a `style=""` attribute. Code is therefore highlighted by Prism (classes
the stylesheet colours), not Shiki (a style attribute per token). The ABAP
grammar is Prism's own.

## Migration from the docs

`scripts/migrate.mjs` read `docs/advanced/insights/` of abap2UI5/docs once,
wrote the essays here with a frontmatter and rewritten links, copied the
SVGs, and generated the redirect stubs in `migration/docs-stubs/`. It is
kept for the record and for a re-run should the docs change before the
switch; after the switch, this repository is the source.

## License

MIT, see [LICENSE](LICENSE). Inter is under the SIL Open Font License
([public/fonts/NOTICE.md](public/fonts/NOTICE.md)).
