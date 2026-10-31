// The four parts of the series, in reading order, and the three ways in. The
// essays carry their part in the frontmatter; everything else about a part -
// its name, its one line, where it sits - lives here, once.

export const PART_IDS = ["why", "how", "day", "where"] as const;
export type PartId = (typeof PART_IDS)[number];

export interface Part {
  id: PartId;
  title: string;
  lead: string;
}

export const PARTS: Part[] = [
  {
    id: "why",
    title: "Why",
    lead: "What the framework is for, before how it works.",
  },
  {
    id: "how",
    title: "How It Works",
    lead:
      "The mechanism under the app, one piece per article. The block to read end to end if you like knowing why something works before you use it.",
  },
  {
    id: "day",
    title: "A Working Day",
    lead:
      "What an ABAP developer meets in the first week, and how each old habit carries over — messages, locks, F4, authorizations, the launchpad tile.",
  },
  {
    id: "where",
    title: "Where It Belongs",
    lead:
      "Releases, clean core, deployment shapes, and the honest comparison against the alternatives — including the cases where you should pick something else.",
  },
];

export const partById = (id: PartId): Part => PARTS.find((p) => p.id === id)!;

/* The three ways in: a reader is a developer, an architect or someone who
 * decides, and each gets a path through the same 37 essays. `numbers` are
 * the essays in the order to read them; `minutes` is the honest total at one
 * coffee per essay. */
export interface Path {
  id: string;
  who: string;
  title: string;
  lead: string;
  numbers: number[];
  minutes: number;
}

export const PATHS: Path[] = [
  {
    id: "developer",
    who: "For developers",
    title: "How it works, end to end",
    lead: "Two strings per request, one handler, a new instance every time. Eleven essays, each a mechanism you will meet in your first week.",
    numbers: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    minutes: 60,
  },
  {
    id: "architect",
    who: "For architects",
    title: "Where it belongs in your landscape",
    lead: "Releases from 7.02 to ABAP Cloud, clean core, on-stack or side-by-side, and the comparison against RAP, freestyle and low-code.",
    numbers: [5, 6, 27, 28, 29, 30, 31, 33, 34, 35],
    minutes: 55,
  },
  {
    id: "decision",
    who: "For decision makers",
    title: "The case in twenty minutes",
    lead: "Why the thirty-line screen never gets built today, what changes without a build or a deploy, and what your team keeps.",
    numbers: [2, 11, 27, 33],
    minutes: 20,
  },
];
