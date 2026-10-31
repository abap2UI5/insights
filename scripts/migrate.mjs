#!/usr/bin/env node
// Bring the 37 essays over from the docs repository, once.
//
//   node scripts/migrate.mjs [path/to/abap2UI5/docs]      (default: ../docs)
//
// What it does, and nothing else:
//   1. reads docs/advanced/insights/index.md for the part each essay is in
//      and its one-line blurb, and NN-slug.md for the text;
//   2. writes src/content/essays/NN-slug.md with a frontmatter (title, number,
//      part, description) and without the H1 - the page renders the title;
//   3. rewrites the links: a sister essay becomes /insights/<slug>/, a docs page
//      becomes the absolute https://abap2ui5.github.io/docs/... address, the
//      use-case diagrams move under /insights/use_cases/;
//   4. copies the SVGs from docs/public/insights/ and the six use-case SVGs
//      into public/;
//   5. writes migration/docs-stubs/: one page per essay for the docs
//      repository to keep at the old address, redirecting here (see
//      migration/DOCS-REPO.md).
//
// It is safe to run twice: everything it writes it writes whole.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : join(ROOT, "..", "docs");
const SRC = join(DOCS, "docs", "advanced", "insights");
const OUT = join(ROOT, "src", "content", "essays");
const PUBLIC = join(ROOT, "public");
const STUBS = join(ROOT, "migration", "docs-stubs");
const DOCS_URL = "https://abap2ui5.github.io/docs";
const HERE = "/insights/";

if (!existsSync(SRC)) {
  console.error(`migrate: no essays at ${SRC}. Pass the path of the docs repository.`);
  process.exit(1);
}
for (const d of [OUT, join(PUBLIC, "use_cases"), STUBS]) mkdirSync(d, { recursive: true });

/* ---- 1. the index: part and blurb per slug ------------------------------- */
const PART_BY_HEADING = { Why: "why", "How It Works": "how", "A Working Day": "day", "Where It Belongs": "where" };
const index = readFileSync(join(SRC, "index.md"), "utf8");
const meta = new Map(); // slug -> { part, description }
let part = null;
for (const line of index.split("\n")) {
  const h = line.match(/^## (.+?)\s*$/);
  if (h) { part = PART_BY_HEADING[h[1]] ?? null; continue; }
  const row = line.match(/^\| \[#\d+ .+?\]\(\/advanced\/insights\/([^)#]+)\) \| (.+?) \|\s*$/);
  if (row && part) meta.set(row[1], { part, description: row[2].replace(/`/g, "").trim() });
}
if (meta.size !== 37) console.warn(`migrate: the index names ${meta.size} essays, expected 37`);

/* ---- 2./3. the essays ---------------------------------------------------- */
const yaml = (s) => JSON.stringify(s); // a JSON string is a valid YAML scalar

function rewriteLinks(md) {
  return md.replace(/\]\((\/[^)\s]+)\)/g, (m, target) => {
    const [path, hash] = target.split("#");
    const anchor = hash ? `#${hash}` : "";
    // a sister essay
    let e = path.match(/^\/advanced\/insights\/([^/]+?)(?:\.html)?$/);
    if (e) return `](${HERE}${e[1]}/${anchor})`;
    // a diagram of the series: already under /insights/
    if (path.startsWith(HERE)) return m;
    // a use-case diagram, moved here
    e = path.match(/^\/advanced\/use_cases\/([^/]+\.svg)$/);
    if (e) return `](${HERE}use_cases/${e[1]})`;
    // everything else is a page of the manual
    return `](${DOCS_URL}${path}${anchor})`;
  });
}

const files = readdirSync(SRC).filter((f) => /^\d{2}-.+\.md$/.test(f)).sort();
let n = 0;
for (const file of files) {
  const slug = basename(file, ".md");
  const number = Number(slug.slice(0, 2));
  const text = readFileSync(join(SRC, file), "utf8");
  const h1 = text.match(/^# #(\d+) (.+?)\s*$/m);
  if (!h1) { console.warn(`migrate: ${file} has no "# #N Title" heading, skipped`); continue; }
  const title = h1[2];
  const m = meta.get(slug);
  if (!m) { console.warn(`migrate: ${file} is not in index.md, skipped`); continue; }
  const body = text.replace(h1[0] + "\n", "").replace(/^\s*\n/, "");
  const out = `---
title: ${yaml(title)}
number: ${number}
part: ${m.part}
description: ${yaml(m.description)}
---

${rewriteLinks(body)}`;
  writeFileSync(join(OUT, file), out);

  /* 5. the stub the docs repository keeps at the old address */
  const here = `https://abap2ui5.github.io${HERE}${slug}/`;
  writeFileSync(
    join(STUBS, file),
    `---
title: "#${number} ${title.replace(/"/g, '\\"')}"
description: ${yaml(m.description)}
head:
  - - meta
    - http-equiv: refresh
      content: "0; url=${here}"
  - - link
    - rel: canonical
      href: ${here}
sidebar: false
---

# #${number} ${title}

This essay has moved to [abap2UI5 Insights](${here}){target="_self"}.
`,
  );
  n++;
}
console.log(`migrate: ${n} essays written to src/content/essays/`);

/* ---- 4. the diagrams ----------------------------------------------------- */
let svgs = 0;
for (const f of readdirSync(join(DOCS, "docs", "public", "insights"))) {
  if (!f.endsWith(".svg")) continue;
  copyFileSync(join(DOCS, "docs", "public", "insights", f), join(PUBLIC, f));
  svgs++;
}
for (const f of readdirSync(join(DOCS, "docs", "public", "advanced", "use_cases"))) {
  if (!f.endsWith(".svg")) continue;
  copyFileSync(join(DOCS, "docs", "public", "advanced", "use_cases", f), join(PUBLIC, "use_cases", f));
  svgs++;
}
console.log(`migrate: ${svgs} SVGs copied to public/`);

/* the index stub too */
writeFileSync(
  join(STUBS, "index.md"),
  `---
title: Blogs
head:
  - - meta
    - http-equiv: refresh
      content: "0; url=https://abap2ui5.github.io${HERE}"
  - - link
    - rel: canonical
      href: https://abap2ui5.github.io${HERE}
sidebar: false
---

# Blogs

The essays have a site of their own now: [abap2UI5 Insights](https://abap2ui5.github.io${HERE}){target="_self"}.
`,
);
console.log(`migrate: ${n + 1} redirect stubs written to migration/docs-stubs/`);
