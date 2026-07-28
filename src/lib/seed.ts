export type community = {
    id: string;
    slug: string;
    name: string;
    description: string;
    membercount: number;
}

export type post = {
    id: string;
    communitySlug: string;
    title: string;
    body: string;
    authorName: string;
    createdAt: string;
    upvotes: number;
}

export const communities: community[] = [
  {
    id: "1",
    slug: "upsc",
    name: "UPSC",
    description: "Prelims, Mains, optional subjects, strategy, and current affairs.",
    membercount: 4200,
  },
  {
    id: "2",
    slug: "jee",
    name: "JEE",
    description: "JEE Main & Advanced — PCM doubts, plans, and rank talk.",
    membercount: 6100,
  },
  {
    id: "3",
    slug: "neet",
    name: "NEET",
    description: "NEET UG prep, NCERT, mocks, and medical college questions.",
    membercount: 5800,
  },
  {
    id: "4",
    slug: "gate",
    name: "GATE",
    description: "GATE prep by branch, PSUs, and M.Tech discussions.",
    membercount: 1900,
  },
  {
    id: "5",
    slug: "careers",
    name: "Careers / jobs in India",
    description: "Placements, first job, switches, government vs private.",
    membercount: 2700,
  },
];

export const posts: post[] = [
  {
    id: "p1",
    communitySlug: "upsc",
    title: "How many months for Polity if I'm starting late?",
    body: "Working professional, 2 hours/day. Is Laxmikant + mocks enough for Prelims?",
    authorName: "Asha",
    createdAt: "2026-07-18",
    upvotes: 24,
  },
  {
    id: "p2",
    communitySlug: "upsc",
    title: "Optional subject: Sociology vs PSIR?",
    body: "Background in engineering. Want something scoring with decent guidance online.",
    authorName: "Rohan",
    createdAt: "2026-07-19",
    upvotes: 31,
  },
  {
    id: "p3",
    communitySlug: "jee",
    title: "JEE Adv maths — which chapters first?",
    body: "Done board-level calculus. Confused between algebra vs coordinate geometry next.",
    authorName: "Neha",
    createdAt: "2026-07-17",
    upvotes: 18,
  },
  {
    id: "p4",
    communitySlug: "jee",
    title: "Is one coaching module enough or mix books?",
    body: "Using one major coaching material. Do I still need HCV / other books?",
    authorName: "Vikram",
    createdAt: "2026-07-20",
    upvotes: 12,
  },
  {
    id: "p5",
    communitySlug: "neet",
    title: "Best way to revise NCERT Biology?",
    body: "First read done. How do you revise without rereading every line?",
    authorName: "Fatima",
    createdAt: "2026-07-16",
    upvotes: 45,
  },
  {
    id: "p6",
    communitySlug: "neet",
    title: "Physics numericals feel slow — tips?",
    body: "Concepts ok, speed is bad in full mocks. What worked for you?",
    authorName: "Karan",
    createdAt: "2026-07-21",
    upvotes: 22,
  },
  {
    id: "p7",
    communitySlug: "gate",
    title: "GATE CS: is 6 months enough from basics?",
    body: "College final year, weak in TOC and OS. Realistic plan?",
    authorName: "Meera",
    createdAt: "2026-07-15",
    upvotes: 27,
  },
  {
    id: "p8",
    communitySlug: "gate",
    title: "PSU vs M.Tech after GATE?",
    body: "Rank around expected 500–800 (hypothetical). How did you decide?",
    authorName: "Arjun",
    createdAt: "2026-07-22",
    upvotes: 16,
  },
  {
    id: "p9",
    communitySlug: "careers",
    title: "First job after B.Tech: service company or wait for product?",
    body: "Have one service offer. Worth waiting 2–3 months for product interviews?",
    authorName: "Sneha",
    createdAt: "2026-07-14",
    upvotes: 39,
  },
  {
    id: "p10",
    communitySlug: "careers",
    title: "How to explain a drop year in interviews?",
    body: "Took a year for exams. What honest framing worked for you?",
    authorName: "Dev",
    createdAt: "2026-07-23",
    upvotes: 21,
  },
];

