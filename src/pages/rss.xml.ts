// The feed, written by hand: a few dozen items are not worth a dependency. The essays
// carry no date - they are chapters, not posts - so the feed is in reading
// order and the channel's date is the build's.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const root = new URL(base, site).href;
  const essays = (await getCollection("essays")).sort((a, b) => a.data.order - b.data.order);
  const items = essays
    .map(
      (e) => `    <item>
      <title>${esc(`#${e.data.number} ${e.data.title}`)}</title>
      <link>${root}${e.id}/</link>
      <guid isPermaLink="true">${root}${e.id}/</guid>
      <description>${esc(e.data.description ?? e.data.blurb)}</description>
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>abap2UI5 Insights</title>
    <link>${root}</link>
    <atom:link href="${root}rss.xml" rel="self" type="application/rss+xml"/>
    <description>Short essays about one idea: what happens when the ABAP server sends the screen instead of only the data.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
