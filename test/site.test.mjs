// What the built site must keep, read off dist/ after `npm run build`.
// node:test, no browser: the pages are static HTML, so the properties worth
// holding are in the files - the addresses, the policy, no script and no
// inline style, every essay present, every local reference resolvable.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const DIST = path.join(import.meta.dirname, "..", "dist");
const BASE = "/insights/";
const ESSAYS = path.join(import.meta.dirname, "..", "src", "content", "essays");

const walk = (dir) =>
  fs.readdirSync(dir).flatMap((e) => {
    const p = path.join(dir, e);
    return fs.statSync(p).isDirectory() ? walk(p) : [p];
  });
const pages = walk(DIST).filter((f) => f.endsWith(".html"));
const read = (f) => fs.readFileSync(f, "utf8");
const home = read(path.join(DIST, "index.html"));

const slugs = fs.readdirSync(ESSAYS).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
const numbers = slugs.map((s) => Number(s.slice(0, 2)));

/* The addresses other sites point at. abap2UI5/docs keeps a redirect stub
 * for every essay's old address under /docs/advanced/insights/, each naming
 * the essay here by its slug, and LinkedIn posts carry them. A renamed file
 * is a dead link somewhere this repository cannot see - rename one only
 * together with its stub in docs/public/advanced/insights/ over there. */
const ADDRESSES = [
  "01-somewhere-on-the-way-to-ui5",
  "02-the-cost-of-a-screen",
  "03-one-class-no-programming-model",
  "04-no-annotation-in-between",
  "05-ui5-over-the-wire",
  "06-the-frontend-knows-nothing",
  "07-one-handler-for-every-app",
  "08-only-the-changed-part",
  "09-a-new-instance-on-every-request",
  "10-swapping-the-view-at-runtime",
  "11-no-build-no-deploy-no-cache",
  "12-where-your-own-javascript-goes",
  "13-four-verbs-every-control",
  "14-a-classrun-for-the-browser",
  "15-where-the-selection-screen-went",
  "16-one-click-one-request",
  "17-what-the-client-can-do",
  "18-call-screen-leave-screen",
  "19-where-f4-went",
  "20-message-still-works",
  "21-the-lock-is-gone-by-the-next-click",
  "22-who-may-start-which-app",
  "23-100-rows-four-hours-one-request",
  "24-abap-unit-for-a-screen",
  "25-when-one-class-is-not-enough",
  "26-a-tile-like-any-other",
  "27-one-codebase-702-to-abap-cloud",
  "28-cloud-ready-is-a-property-of-your-app",
  "29-when-the-api-is-not-released",
  "30-on-stack-or-side-by-side",
  "31-one-app-many-systems",
  "32-from-its-to-abap2ui5",
  "33-rap-or-abap2ui5",
  "34-freestyle-or-abap2ui5",
  "36-written-for-agents",
  "37-what-the-client-can-send",
  "38-how-many-users",
  "39-upgrading-the-framework",
];

test("every address the docs' redirect stubs point at is still an essay here", () => {
  for (const slug of ADDRESSES) assert.ok(fs.existsSync(path.join(DIST, slug, "index.html")), `${BASE}${slug}/ - abap2UI5/docs redirects there`);
});

test("every essay in src/content/essays has a page at its own slug", () => {
  assert.ok(slugs.length >= 30, `${slugs.length} essays`);
  for (const slug of slugs) assert.ok(fs.existsSync(path.join(DIST, slug, "index.html")), `${BASE}${slug}/`);
});

test("no page runs a script or carries an inline style, and the policy says so", () => {
  for (const file of pages) {
    const html = read(file);
    const page = path.relative(DIST, file);
    assert.equal([...html.matchAll(/<script\b/gi)].length, 0, `${page}: a <script>`);
    assert.doesNotMatch(html, /\son[a-z]+=/i, `${page}: an inline event handler`);
    assert.doesNotMatch(html, /\sstyle="/i, `${page}: an inline style the policy would refuse`);
    const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/);
    assert.ok(csp, `${page}: a Content-Security-Policy meta`);
    assert.match(csp[1], /script-src 'self'(;|$)/);
    assert.match(csp[1], /style-src 'self'(;|$)/);
  }
});

test("everything a page loads or links locally is in dist/, under the base", () => {
  for (const file of pages) {
    const html = read(file);
    const page = path.relative(DIST, file);
    const refs = [...html.matchAll(/\s(?:src|href)="([^"#]+)(?:#[^"]*)?"/g)].map((m) => m[1]).filter((u) => u.startsWith("/"));
    for (const ref of refs) {
      assert.ok(ref.startsWith(BASE), `${page}: ${ref} is outside ${BASE}`);
      const target = path.join(DIST, ref.slice(BASE.length) || "index.html");
      const resolved = fs.existsSync(target) && fs.statSync(target).isDirectory() ? path.join(target, "index.html") : target;
      assert.ok(fs.existsSync(resolved), `${page}: ${ref} is not in dist/`);
    }
    for (const m of html.matchAll(/\s(?:src)="(https?:[^"]+)"/g)) assert.fail(`${page} loads ${m[1]}`);
  }
});

test("ABAP is highlighted: Prism tokens, not plain text", () => {
  const essay = read(path.join(DIST, "01-somewhere-on-the-way-to-ui5", "index.html"));
  assert.match(essay, /class="language-abap"/);
  assert.match(essay, /<span class="token keyword">/);
});

test("the family's top line: the brand leads home, the breadcrumb marks the page", () => {
  for (const file of pages) {
    const html = read(file);
    assert.match(html, /<a class="brand" href="https:\/\/abap2ui5\.github\.io\/">/, path.relative(DIST, file));
    assert.match(html, /aria-current="page"/, path.relative(DIST, file));
  }
});

test("the index lists every essay, every part and the ways in", () => {
  assert.equal((home.match(/class="essays"/g) || []).length, 6, "six parts");
  for (const n of numbers) assert.match(home, new RegExp(`<span class="n">#${n}</span>`), `#${n}`);
  assert.match(home, /class="path" href="https:\/\/abap2ui5\.github\.io\/why\/"/, "the case for using it is the why-site's");
  for (const p of ["developer", "architect"]) {
    assert.match(home, new RegExp(`href="${BASE}for/${p}/"`));
    assert.ok(fs.existsSync(path.join(DIST, "for", p, "index.html")), `${BASE}for/${p}/`);
  }
});

test("no VitePress attribute syntax leaks into a page", () => {
  for (const file of pages) assert.doesNotMatch(read(file), /\{\s*(target|width)=/, path.relative(DIST, file));
});

test("an image that states its size states the size of its SVG", () => {
  // width/height on <img> set the rendered size: a stale pair scales the
  // diagram, and its 13px labels with it, up past the text around it
  for (const file of pages) {
    for (const [, src, w, h] of read(file).matchAll(/<img src="\/insights\/([^"]+\.svg)"[^>]*? width="(\d+)" height="(\d+)"/g)) {
      const svg = read(path.join(DIST, src));
      const [, vw, vh] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      assert.deepEqual([w, h], [vw, vh], `${path.relative(DIST, file)}: ${src}`);
    }
  }
});

test("the links to the manual are absolute and name no page of this site", () => {
  for (const file of pages) {
    const html = read(file);
    assert.doesNotMatch(html, /href="\/(advanced|cookbook|configuration|get_started|resources|tutorials)\//, `${path.relative(DIST, file)}: a docs link left relative`);
  }
});

test("the canonical address is the published one, and the feed is there", () => {
  assert.match(home, /<link rel="canonical" href="https:\/\/abap2ui5\.github\.io\/insights\/">/);
  const rss = read(path.join(DIST, "rss.xml"));
  assert.equal((rss.match(/<item>/g) || []).length, slugs.length);
});
