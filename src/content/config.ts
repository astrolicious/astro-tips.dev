import { defineCollection, z, reference } from "astro:content"

const authors = defineCollection({
    type: "content",
    schema: ({ image }) => z.object({
        name: z.string(),
        avatar: image(),
        links: z.object({
            website: z.string().url().optional(),
            github: z.string().url().optional(),
        }).optional().default({})
    })
})

const tips = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        description: z.string(),
        authors: z.array(reference("authors")),
        date: z.coerce.date()
    })
})

export const collections = {
    authors,
    tips
}