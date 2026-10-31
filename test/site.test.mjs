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

test("every essay in src/content/essays has a page at its own slug", () => {
  const slugs = fs.readdirSync(ESSAYS).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  assert.equal(slugs.length, 37, "thirty-seven essays");
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

test("the index lists all thirty-seven and the three ways in", () => {
  assert.equal((home.match(/class="essays"/g) || []).length, 4, "four parts");
  for (let n = 1; n <= 37; n++) assert.match(home, new RegExp(`<span class="n">#${n}</span>`), `#${n}`);
  for (const p of ["developer", "architect", "decision"]) {
    assert.match(home, new RegExp(`href="${BASE}for/${p}/"`));
    assert.ok(fs.existsSync(path.join(DIST, "for", p, "index.html")), `${BASE}for/${p}/`);
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
  assert.equal((rss.match(/<item>/g) || []).length, 37);
});
