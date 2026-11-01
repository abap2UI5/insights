// What the family's search finds of this site: one entry per essay, with its
// headings, for the index abap2UI5/docs builds (scripts/lib/search-index.mjs
// there fetches this file at build time and carries it as the "Insights"
// group, read by the search box on https://abap2ui5.github.io/ and the
// playground). The shape is the one every site of the family publishes:
// { site, url, entries: [{ title, text, headings: [[text, anchor]], url }] }.
// A heading's anchor is the id Astro gives it on the essay's page.
//
// `terms` is what the matcher reads last and weighs least: the part, the
// blurb, and the words of the essay that only a few essays use - "rtts",
// "enqueue", "websocket" - so an essay is found by the thing it explains,
// not only by its title. A word in more than a third of the essays decides
// nothing and is left out, as the docs do for their own pages.
import type { APIRoute } from "astro";
import { getCollection, render } from "astro:content";
import { partById } from "../lib/parts";

export const GET: APIRoute = async ({ site }) => {
  const root = new URL(import.meta.env.BASE_URL, site).href;
  const essays = (await getCollection("essays")).sort((a, b) => a.data.order - b.data.order);
  const wordsOf = (body: string) =>
    new Set(
      body
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/\]\([^)]*\)/g, "]")
        .toLowerCase()
        .split(/[^\p{L}\p{N}_]+/u)
        .filter((w) => w.length >= 4 && !/^\d+$/.test(w)),
    );
  const bodies = new Map(essays.map((e) => [e.id, wordsOf(e.body ?? "")]));
  const on = new Map<string, number>();
  for (const words of bodies.values()) for (const w of words) on.set(w, (on.get(w) ?? 0) + 1);
  const ceiling = Math.ceil(essays.length / 3);
  const entries = [];
  for (const e of essays) {
    const { headings } = await render(e);
    entries.push({
      title: `#${e.data.number} ${e.data.title}`,
      text: e.data.description ?? e.data.blurb,
      headings: headings.filter((h) => h.depth <= 3).map((h) => [h.text, h.slug]),
      terms: [partById(e.data.part).title, e.data.blurb, ...[...bodies.get(e.id)!].filter((w) => on.get(w)! <= ceiling)]
        .join(" ")
        .toLowerCase(),
      url: `${root}${e.id}/`,
    });
  }
  return new Response(JSON.stringify({ site: "Insights", url: root, entries }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
