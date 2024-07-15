import { defineCollection, z } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import { minVersion, outside, validRange } from 'semver';
import pkg from '../../package.json';

const astroVersion = minVersion(pkg.dependencies.astro)?.version;

const starlightSchema = defineCollection({
	schema: docsSchema({
		extend: z.object({
			astroRange: z
				.string()
				.refine(validRange, { message: 'Must be a valid semver range' })
				.refine(
					(range) => {
						// check if range is bigger than the current Astro version.
						return astroVersion && !outside(astroVersion, range, '<');
					},
					{
						message: `'astroRange' must be compatible with the current released Astro version: '${astroVersion}'`,
					}
				)
				.optional(),
		}),
	}),
});

const resourcesSchema = defineCollection({
	type: 'data',
	schema: z.object({
		category: z.enum([
			'css',
			'auth',
			'rss',
			'images',
			'editor',
			'markdown',
			'performance',
			'utilities',
			'animation',
			'i18n',
			'db',
			'deploy',
			'view-transitions',
			'3rd-party',
			'migration',
		]),
		title: z.string(),
		link: z.string(),
		description: z.string().optional(),
		updated: z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date()),
	}),
});

export const tagsSchema = defineCollection({
	type: 'data',
	schema: z.object({
		title: z.string()
	})
})

export const collections = {
	docs: starlightSchema,
	resources: resourcesSchema,
	tags: tagsSchema
};
