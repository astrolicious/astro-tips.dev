import { defineCollection, reference } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { minVersion, outside, validRange } from 'semver';
import pkg from '../package.json';
import { compatibilitySchema } from './lib/compatibility';

const astroVersion = minVersion(pkg.dependencies.astro)?.version;

const socialsSchema = z
	.object({
		bluesky: z.url(),
		x: z.url(),
		mastodon: z.url(),
		linkedin: z.url(),
		youtube: z.url(),
		discord: z.url(),
		twitch: z.url(),
		threads: z.url(),
		instagram: z.url(),
		gitlab: z.url(),
		codeberg: z.url(),
		codepen: z.url(),
		rss: z.url(),
	})
	.partial();

const authorsSchema = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/authors' }),
	schema: z.object({
		name: z.string().min(1),
		github: z.string().min(1).optional(),
		avatar: z.url().optional(),
		bio: z.string().optional(),
		website: z.url().optional(),
		socials: socialsSchema.optional(),
	}),
});

const starlightSchema = defineCollection({
	loader: docsLoader(),
	schema: docsSchema({
		extend: z.object({
			astroRange: z
				.string()
				.refine((val) => validRange(val) !== null, { error: 'Must be a valid semver range' })
				.refine(
					(range) => {
						// check if range is bigger than the current Astro version.
						return Boolean(astroVersion && !outside(astroVersion, range, '<'));
					},
					{
						error: `'astroRange' must be compatible with the current released Astro version: '${astroVersion}'`,
					}
				)
				.optional(),
			authors: z.array(reference('authors')).optional(),
			compatibility: compatibilitySchema,
		}),
	}),
});

const resourcesSchema = defineCollection({
	loader: file('src/content/resources.json'),
	schema: z.object({
		slug: z.string(),
		tags: z.array(reference('tags')),
		title: z.string(),
		link: z.string(),
		description: z.string().optional(),
		updated: z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date()),
		authors: z.array(reference('authors')).optional(),
	}),
});

const tagsSchema = defineCollection({
	loader: file('src/content/tags.json'),
	schema: z.object({
		title: z.string(),
	}),
});

export const collections = {
	authors: authorsSchema,
	docs: starlightSchema,
	resources: resourcesSchema,
	tags: tagsSchema,
};
