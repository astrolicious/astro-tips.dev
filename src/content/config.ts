import { defineCollection, z } from 'astro:content'
import { docsSchema } from '@astrojs/starlight/schema'
import { validRange } from 'semver'

export const collections = {
	docs: defineCollection({
		schema: docsSchema({
			extend: z.object({
				astroRange: z
					.string()
					.refine(validRange, {message: 'Must be a valid semver range'})
					.optional(),
			}),
		}),
	}),
}
