import { defineCollection, reference } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { minVersion, outside, validRange } from 'semver';
import pkg from '../package.json';
import tagsData from './content/tags.json';
import { compatibilitySchema } from './lib/compatibility';
import { parseResourcesWithGitMetadata } from './lib/resources-loader';

const astroVersion = minVersion(pkg.dependencies.astro)?.version;
const tagIds = Object.keys(tagsData) as [string, ...string[]];

const socialsSchema = z
	.strictObject({
		bluesky: z.url().describe('Bluesky profile URL.'),
		x: z.url().describe('X (Twitter) profile URL.'),
		mastodon: z.url().describe('Mastodon profile URL.'),
		linkedin: z.url().describe('LinkedIn profile URL.'),
		youtube: z.url().describe('YouTube channel URL.'),
		discord: z.url().describe('Discord profile or server URL.'),
		twitch: z.url().describe('Twitch channel URL.'),
		threads: z.url().describe('Threads profile URL.'),
		instagram: z.url().describe('Instagram profile URL.'),
		gitlab: z.url().describe('GitLab profile URL.'),
		codeberg: z.url().describe('Codeberg profile URL.'),
		codepen: z.url().describe('CodePen profile URL.'),
		rss: z.url().describe('RSS feed URL.'),
	})
	.partial();

const authorsSchema = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/authors' }),
	schema: z.object({
		name: z.string().min(1).describe('Display name of the author.'),
		github: z.string().min(1).optional().describe('GitHub username (without @).'),
		avatar: z.url().optional().describe('Custom avatar image URL (defaults to GitHub avatar).'),
		bio: z.string().optional().describe('Short bio or tagline.'),
		website: z.url().optional().describe('Personal website URL.'),
		socials: socialsSchema.optional().describe('Social profile links.'),
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
			authors: z
				.array(z.string().min(1).pipe(reference('authors')))
				.optional()
				.describe('Author IDs referencing files in src/content/authors/ (filename without .json).'),
			compatibility: compatibilitySchema,
		}),
	}),
});

const resourcesSchema = defineCollection({
	loader: file('src/content/resources.json', {
		parser: parseResourcesWithGitMetadata,
	}),
	schema: z.strictObject({
		slug: z.string().min(1).describe('Unique URL-friendly identifier for the resource.'),
		tags: z
			.array(z.enum(tagIds).pipe(reference('tags')))
			.min(1)
			.describe('One or more tag IDs from src/content/tags.json.'),
		title: z.string().min(1).describe('Title of the external resource.'),
		link: z.url().describe('Full URL of the external resource.'),
		description: z.string().optional().describe('Optional short summary of the resource.'),
		updated: z.iso.date().pipe(z.coerce.date()).describe('Last updated date in YYYY-MM-DD format.'),
		authors: z
			.array(z.string().min(1).pipe(reference('authors')))
			.optional()
			.describe('Author IDs referencing files in src/content/authors/ (filename without .json).'),
		addedAt: z
			.union([z.number(), z.string(), z.date()])
			.pipe(z.coerce.date())
			.optional()
			.meta({ readOnly: true })
			.describe('Auto-populated from git history at build time; do not set manually.'),
		newUntil: z
			.union([z.number(), z.string(), z.date()])
			.pipe(z.coerce.date())
			.nullable()
			.optional()
			.meta({ readOnly: true })
			.describe('Auto-populated from git history at build time; do not set manually.'),
	}),
});

const tagsSchema = defineCollection({
	loader: file('src/content/tags.json'),
	schema: z.strictObject({
		title: z.string().min(1).describe('Display label for the tag.'),
	}),
});

export const collections = {
	authors: authorsSchema,
	docs: starlightSchema,
	resources: resourcesSchema,
	tags: tagsSchema,
};
