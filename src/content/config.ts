import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';
import { minVersion, outside, validRange } from 'semver';
import pkg from '../../package.json';

const astroVersion = minVersion(pkg.devDependencies.astro)?.version;

const starlightSchema = defineCollection({
	loader: docsLoader(),
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
	loader: glob({ pattern: '**/*.json', base: './src/content/resources' }),
	schema: z.object({
		tags: z.array(z.string()),
		title: z.string(),
		link: z.string(),
		description: z.string().optional(),
		updated: z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date()),
	}),
});

export const collections = {
	docs: starlightSchema,
	resources: resourcesSchema,
};
