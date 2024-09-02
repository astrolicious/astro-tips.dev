import { defineCollection, z } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import { minVersion, outside, validRange } from 'semver';
import pkg from '../../package.json';
import { astroMonthlyBlogResourceLoader } from '@alexanderniebuhr/astro-monthly-blog-resource-loader';

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
		tags: z.array(z.string()),
		title: z.string(),
		link: z.string(),
		description: z.string().optional(),
		updated: z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date()),
	}),
});

const automatedresources = defineCollection({
	loader: astroMonthlyBlogResourceLoader({
		urls: [
			'https://raw.githubusercontent.com/withastro/astro.build/main/src/content/blog/whats-new-june-2024.mdx',
			'https://raw.githubusercontent.com/withastro/astro.build/main/src/content/blog/whats-new-july-2024.mdx',
			'https://raw.githubusercontent.com/withastro/astro.build/main/src/content/blog/whats-new-august-2024.mdx',
		],
		exclude: [
			/github.com/,
			/astro.build/,
			/x.com/,
			/2023.stateofjs.com/,
			/astrolicious.dev/,
			/astro-tips.dev/,
			/reddit.com\/r\/withastro\/$/,
		],
	}),
});

export const collections = {
	docs: starlightSchema,
	resources: resourcesSchema,
	automatedresources: automatedresources,
};
