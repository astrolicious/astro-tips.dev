import { defineCollection, z } from 'astro:content'
import { docsSchema } from '@astrojs/starlight/schema'
import { minVersion, outside, validRange } from 'semver'
import pkg from 'package.json'

export const collections = {
	docs: defineCollection({
		schema: docsSchema({
			extend: z.object({
				astroRange: z
					.string()
					.refine(validRange, {message: 'Must be a valid semver range'})
					.refine((range) => {
						const astroVersion = minVersion(pkg.dependencies.astro)?.version
						// check if range is less than the current astro version
						return astroVersion && !outside(astroVersion, range, '<')
					}, {message: 'Must be compatible with the current Astro version'})
					.optional(),
			}),
		}),
	}),
}
