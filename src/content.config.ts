// The essays: one markdown file per article in src/content/essays/, written
// there by scripts/migrate.mjs from the docs repository and edited in place
// from then on. The file name carries the number and the slug
// (06-ui5-over-the-wire.md); the frontmatter carries what the index needs.
// The number is the position in reading order: #1 is read first.
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { PART_IDS } from "./lib/parts";

const essays = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/essays" }),
  schema: z.object({
    title: z.string(),
    // the position in reading order, and the number in the file name
    number: z.number().int().positive(),
    part: z.enum(PART_IDS),
    // the one line under the title in the index, as the docs' table had it
    blurb: z.string(),
    // the page's meta description, where the essay has one of its own
    description: z.string().optional(),
  }),
});

export const collections = { essays };
