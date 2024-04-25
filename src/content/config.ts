import { defineCollection, z } from 'astro:content'
import { docsSchema } from '@astrojs/starlight/schema'
import { minVersion, outside, validRange } from 'semver'
import pkg from 'package.json'

const astroVersion = minVersion(pkg.dependencies.astro)?.version

const starlightSchema = defineCollection({
	schema: docsSchema({
		extend: z.object({
			astroRange: z
				.string()
				.refine(validRange, { message: 'Must be a valid semver range' })
				.refine((range) => {
					// check if range is bigger than the current Astro version.
					return astroVersion && !outside(astroVersion, range, '<')
				}, { message: `'astroRange' must be compatible with the current released Astro version: '${astroVersion}'` })
				.optional(),
			authors: z.array(z.union([z.string(), z.object({
				/**
				 * The name of the author.
				 */
				name: z.string().min(1),
				/**
				 * The title of the author.
				 */
				title: z.string().optional(),
				/**
				 * The URL or path to the author's picture.
				 */
				picture: z.string().optional(),
				/**
				 * The URL to the author's website.
				 */
				url: z.string().url().optional(),
			})])).optional(),
		}),
	}),
})


const resourcesSchema = defineCollection({
	type: 'data',
	schema: z.object({
		category: z.enum(["css",
			"auth",
			"rss",
			"images",
			"editor",
			"markdown",
			"performance",
			"utilities",
			"animation",
			"i18n",
			"db"]),
		title: z.string(),
		link: z.string(),
		description: z.string().optional(),
	}),
});

export const collections = {
	docs: starlightSchema,
	resources: resourcesSchema,
}
