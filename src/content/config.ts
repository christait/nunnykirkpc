import { defineCollection, z } from 'astro:content';

// Parish councillors — drives the People page.
const councillors = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string(), // e.g. "Chair", "Vice-Chair", "Councillor"
    email: z.string().email().optional(),
    photo: z.string().optional(),
    order: z.number().optional(),
  }),
});

// Council meetings — drives the Meetings page. Each meeting can carry an
// agenda (published before) and minutes (published after) as uploaded PDFs.
const meetings = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    location: z.string().optional(),
    agenda: z.string().optional(), // path to uploaded agenda PDF
    minutes: z.string().optional(), // path to uploaded minutes PDF
    draft: z.boolean().optional().default(false),
  }),
});

// General documents — drives the Documents page, grouped by category.
const documents = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(), // Policies & procedures / Finance / Public notices / Other
    file: z.string(), // path to uploaded PDF
    date: z.coerce.date().optional(),
    order: z.number().optional(),
  }),
});

// Static Markdown pages (History, Home intro).
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    eyebrow: z.string().optional(),
  }),
});

export const collections = {
  councillors,
  meetings,
  documents,
  pages,
};
