# What abap2UI5/docs does on its side

Four changes, one pull request, after this site is live at
https://abap2ui5.github.io/insights/.

## 1. Keep the old addresses alive

Replace the 38 files in `docs/advanced/insights/` with the ones in
`docs-stubs/` (same names). Each stub is a VitePress page with a
`<meta http-equiv="refresh">` to the new address and a canonical link, so
every link ever posted - LinkedIn, SAP Community, the teaser posts in
`blog/` - still lands on the essay. The SVGs in `docs/public/insights/` can
go; the stubs reference none.

`check:line-length`, `check:vocabulary` and friends run over the stubs like
over any page; they are short and plain and should pass. If a gate objects
to the `{target="_self"}` attribute, drop it - the stub redirects before
anyone clicks.

## 2. Name the new neighbour

`scripts/lib/cross-site.mjs`, the `NEIGHBOURS` list:

```js
export const NEIGHBOURS = [
  '/playground/',
  '/linter/',
  '/insights/',             // the essays
  ...
];
```

Without this, `check:cross-site` reports every link to `/insights/` as
"not a deployment this origin serves".

## 3. The way there from the manual

`docs/.vitepress/config.mjs`, the `nav` - a "More" entry, or the existing
version dropdown; either way the link is same-origin and so carries
`target: "_self"` (CONVENTION §1, and what `check:cross-site` enforces):

```js
{
  text: "More",
  items: [
    { text: "Insights", link: "https://abap2ui5.github.io/insights/", target: "_self" },
    { text: "Release notes", link: "/resources/changelog" },
    { text: "Support", link: "/resources/support" },
    { text: "Contribute", link: "/resources/contribution" },
    { text: "Sponsor", link: "/resources/sponsor" },
  ],
},
```

And the sidebar entry under Resources that today says "Blogs" goes - or
points at the same absolute address.

## 4. The home page and the teasers

- abap2UI5/abap2UI5.github.io: a tile or a line under *More* for
  https://abap2ui5.github.io/insights/ (the home page is the one place that
  lists every site, CONVENTION §1).
- `blog/teaser-posts.md`: the articles' links in future posts point at
  `/insights/<slug>/`. The posts already out keep working through the stubs.
- `llms.txt` and `scripts/generate-llms.mjs`: if the essays are listed there,
  list the new addresses instead - or leave them, the stubs redirect.
