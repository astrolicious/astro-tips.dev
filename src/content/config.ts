import { defineCollection, z } from 'astro:content'
import { docsSchema } from '@astrojs/starlight/schema'
import { validRange } from 'semver'

export const collections = {
	docs: defineCollection({
		schema: docsSchema({
			extend: z.object({
				astroRange: z
					.custom<string>(range => typeof range === 'string' && validRange(range))
					.optional(),
			}),
		}),
	}),
}
