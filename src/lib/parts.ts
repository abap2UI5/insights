// The parts of the series, in reading order, and the ways in. The essays carry
// their part in the frontmatter; everything else about a part - its name, its
// one line, where it sits - lives here, once.

export const PART_IDS = ["rests", "example", "how", "day", "where", "running"] as const;
export type PartId = (typeof PART_IDS)[number];

export interface Part {
  id: PartId;
  title: string;
  lead: string;
}

export const PARTS: Part[] = [
  {
    id: "rests",
    title: "What It Rests On",
    lead: "The two properties that come before the mechanism: a model that may be typed at runtime, and an app that is one class with no programming model around it.",
  },
  {
    id: "example",
    title: "The First Example",
    lead: "The smallest complete app, read line by line — and nothing beside it.",
  },
  {
    id: "how",
    title: "How It Works",
    lead: "The mechanism under the app, one piece per article. The block to read end to end if you like knowing why something works before you use it.",
  },
  {
    id: "day",
    title: "A Working Day",
    lead: "What an ABAP developer meets in the first week, and how each old habit carries over — messages, locks, F4, authorizations, the launchpad tile.",
  },
  {
    id: "where",
    title: "Where It Belongs in the Landscape",
    lead: "Releases, clean core, deployment shapes, and the technical criteria that decide between abap2UI5, RAP and UI5 Freestyle for a given screen.",
  },
  {
    id: "running",
    title: "Running It",
    lead: "What an architect asks before an installation goes productive: the threat model, the sizing, the upgrade.",
  },
];

export const partById = (id: PartId): Part => PARTS.find((p) => p.id === id)!;

/* The ways in. A path lists essays by number, in the order to read them.
 * The series is the technical "why it works like this"; the case for using
 * it - cost, who runs it, the decision - is the why-site's, so the third way
 * in leads there (`href`) instead of picking essays. */
export interface Path {
  id: string;
  who: string;
  title: string;
  lead: string;
  numbers?: number[];
  href?: string;
}

export const PATHS: Path[] = [
  {
    id: "developer",
    who: "For developers",
    title: "How it works, end to end",
    lead: "Two strings per request, one handler, a new instance every time — and the one click, one request model every app is written against.",
    numbers: [5, 16, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  {
    id: "architect",
    who: "For architects",
    title: "Where it belongs, and running it",
    lead: "Releases from 7.02 to ABAP Cloud, clean core, on-stack or side-by-side, RAP or freestyle — then the threat model, the sizing and the upgrade.",
    numbers: [5, 16, 27, 28, 29, 30, 31, 33, 34, 37, 38, 39],
  },
  {
    id: "decision",
    who: "Deciding whether to use it?",
    title: "The case for abap2UI5",
    lead: "What it costs, who runs it, what your organization keeps and when to pick something else — on the page written for that question.",
    href: "https://abap2ui5.github.io/why/",
  },
];
