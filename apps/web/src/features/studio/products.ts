export const products = [
  {
    slug: "disk-vacuum",
    name: "Disk Vacuum",
    category: "Storage & cleanup",
    status: "Early access",
    tone: "mint",
    headline: "Make room for what matters.",
    summary:
      "See what’s taking up space. Find the clutter. Clean up with confidence.",
    description:
      "A visual disk analyzer that helps you understand your storage before you remove anything. Explore files, uncover duplicates, and review every cleanup on your own terms.",
    availability: "Linux verified · macOS & Windows previews",
    repository: "https://github.com/khalids01/disk-vacuum",
    action: "Explore releases",
    href: "https://github.com/khalids01/disk-vacuum/releases",
    features: [
      {
        title: "See the bigger picture",
        text: "Explore a proportional treemap, navigate folders, and find large files with an indexed search.",
      },
      {
        title: "Find the hidden clutter",
        text: "Discover confirmed duplicates, developer caches, AI tool storage, and leftovers from removed apps.",
      },
      {
        title: "Review before you remove",
        text: "Scanning never deletes files. Review cleanup candidates with protected-file checks and trash support.",
      },
    ],
    privacy:
      "File names, paths, hashes, and scan results stay on your device. All scanning and analysis runs locally.",
    note: "DiskVacuum is in early development. Linux is locally verified. macOS and Windows are previews with runtime and signing verification pending; Android device verification is also pending.",
  },
  {
    slug: "job-agent",
    name: "Job Agent",
    category: "Career & productivity",
    status: "In development",
    tone: "peach",
    headline: "A little clarity for your next move.",
    summary:
      "Bring your career profile, job shortlist, and application thinking into one focused workspace.",
    description:
      "A desktop job assistant for a more considered search. Organize career facts, explore matched listings, and draft answers you review and use yourself.",
    availability: "Desktop app · In development",
    repository: "https://github.com/khalids01/job-agent",
    action: "Follow development",
    href: "https://github.com/khalids01/job-agent",
    features: [
      {
        title: "Your career, in context",
        text: "Keep experience, projects, preferences, and reusable answers together in a local career profile.",
      },
      {
        title: "A shortlist with reasons",
        text: "Browse hosted job listings, inspect semantic matches, and review location, salary, and eligibility evidence.",
      },
      {
        title: "Help when you ask for it",
        text: "Open a listing in the browser workspace and request an application-answer draft. You review and apply manually.",
      },
    ],
    privacy:
      "Saved profiles, notes, and application statuses live in local SQLite. Matching sends career facts to the scraper service; requested AI features send relevant content to the selected providers.",
    note: "Job Agent is in active development and requires service configuration. Public installers are not offered here yet. Match scores describe semantic similarity, not hiring probability.",
  },
] as const;
export type Product = (typeof products)[number];
