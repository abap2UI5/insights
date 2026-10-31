#!/usr/bin/env node
// Bring the essays over from the docs repository.
//
//   node scripts/migrate.mjs [path/to/abap2UI5/docs]      (default: ../docs)
//
// What it does, and nothing else:
//   1. reads docs/advanced/insights/index.md: the parts (its ## headings), the
//      order the essays are read in (the order of the table rows, which is not
//      the order of the numbers) and each essay's one-line blurb;
//   2. empties src/content/essays/ and writes NN-slug.md for every essay the
//      index lists, with a frontmatter (title, number, order, part, blurb,
//      description) and without the H1 - the page renders the title;
//   3. rewrites the links: a sister essay becomes /insights/<slug>/, a page of
//      the manual the absolute https://abap2ui5.github.io/docs/... address, the
//      use-case diagrams move under /insights/use_cases/, and VitePress's
//      {target="_self"} goes - this site is no SPA, a link is a link;
//   4. copies the SVGs from docs/public/insights/ and the use-case SVGs into
//      public/.
//
// The parts' names and leads live in src/lib/parts.ts; this script only checks
// that every heading of the index has an id there and stops when one has not.
// It is safe to run twice: everything it writes it writes whole.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : join(ROOT, "..", "docs");
const SRC = join(DOCS, "docs", "advanced", "insights");
const OUT = join(ROOT, "src", "content", "essays");
const PUBLIC = join(ROOT, "public");
const DOCS_URL = "https://abap2ui5.github.io/docs";
const HERE = "/insights/";

if (!existsSync(SRC)) {
  console.error(`migrate: no essays at ${SRC}. Pass the path of the docs repository.`);
  process.exit(1);
}

/* the headings of the index and the id each part has in src/lib/parts.ts */
const PART_BY_HEADING = {
  "What It Rests On": "rests",
  "The First Example": "example",
  "How It Works": "how",
  "A Working Day": "day",
  "Where It Belongs in the Landscape": "where",
  "Running It": "running",
};

/* ---- 1. the index ---------------------------------------------------------- */
const index = readFileSync(join(SRC, "index.md"), "utf8");
const meta = new Map(); // slug -> { part, blurb, order }
let part = null;
let order = 0;
for (const line of index.split("\n")) {
  const h = line.match(/^## (.+?)\s*$/);
  if (h) {
    part = PART_BY_HEADING[h[1]];
    if (!part) {
      console.error(`migrate: the index has a part "${h[1]}" that src/lib/parts.ts and PART_BY_HEADING do not know.`);
      process.exit(1);
    }
    continue;
  }
  const row = line.match(/^\| \[#\d+ .+?\]\(\/advanced\/insights\/([^)#]+)\) \| (.+?) \|\s*$/);
  if (row && part) meta.set(row[1], { part, blurb: row[2].replace(/`/g, "").trim(), order: ++order });
}

/* ---- 2./3. the essays -------------------------------------------------------- */
const yaml = (s) => JSON.stringify(s); // a JSON string is a valid YAML scalar

function rewriteLinks(md) {
  return md
    .replace(/\{target="_self"\}/g, "")
    .replace(/\]\((\/[^)\s]+)\)/g, (m, target) => {
      const [path, hash] = target.split("#");
      const anchor = hash ? `#${hash}` : "";
      let e = path.match(/^\/advanced\/insights\/([^/]+?)(?:\.html)?$/);
      if (e) return `](${HERE}${e[1]}/${anchor})`;
      if (path === "/advanced/insights/") return `](${HERE}${anchor})`;
      if (path.startsWith(HERE)) return m;
      e = path.match(/^\/advanced\/use_cases\/([^/]+\.svg)$/);
      if (e) return `](${HERE}use_cases/${e[1]})`;
      return `](${DOCS_URL}${path}${anchor})`;
    });
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
let n = 0;
for (const file of readdirSync(SRC).filter((f) => /^\d{2}-.+\.md$/.test(f)).sort()) {
  const slug = basename(file, ".md");
  const m = meta.get(slug);
  if (!m) { console.warn(`migrate: ${file} is not in index.md, skipped`); continue; }
  let text = readFileSync(join(SRC, file), "utf8");
  let description;
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (fm) {
    const d = fm[1].match(/^description:\s*(.+)$/m);
    if (d) description = d[1].trim().replace(/^"(.*)"$/, "$1").replace(/\\"/g, '"');
    text = text.slice(fm[0].length);
  }
  const h1 = text.match(/^# #(\d+) (.+?)\s*$/m);
  if (!h1) { console.warn(`migrate: ${file} has no "# #N Title" heading, skipped`); continue; }
  const body = text.replace(h1[0] + "\n", "").replace(/^\s*\n/, "");
  writeFileSync(
    join(OUT, file),
    `---
title: ${yaml(h1[2])}
number: ${Number(h1[1])}
order: ${m.order}
part: ${m.part}
blurb: ${yaml(m.blurb)}
${description ? `description: ${yaml(description)}\n` : ""}---

${rewriteLinks(body)}`,
  );
  n++;
}
if (n !== meta.size) console.warn(`migrate: the index names ${meta.size} essays, ${n} written`);
console.log(`migrate: ${n} essays written to src/content/essays/`);

/* ---- 4. the diagrams --------------------------------------------------------- */
mkdirSync(join(PUBLIC, "use_cases"), { recursive: true });
let svgs = 0;
for (const [from, to] of [
  [join(DOCS, "docs", "public", "insights"), PUBLIC],
  [join(DOCS, "docs", "public", "advanced", "use_cases"), join(PUBLIC, "use_cases")],
]) {
  for (const f of readdirSync(from)) {
    if (!f.endsWith(".svg")) continue;
    copyFileSync(join(from, f), join(to, f));
    svgs++;
  }
}
console.log(`migrate: ${svgs} SVGs copied to public/`);
