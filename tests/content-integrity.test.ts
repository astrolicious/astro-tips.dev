import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
	NEW_RESOURCE_UPDATED_GUARD_DAYS,
	NEW_RESOURCE_WINDOW_DAYS,
	parseResourcesWithGitMetadata,
} from '../src/lib/resources-loader.ts';

interface RawResource {
	slug: string;
	title: string;
	link: string;
	updated: string;
	tags: string[];
	authors?: string[];
}

describe('resources loader & content integrity', () => {
	it('computes addedAt and newUntil for freshly added resources and guards old ones', () => {
		const today = new Date().toISOString().slice(0, 10);
		const veryOld = new Date(
			Date.now() - (NEW_RESOURCE_UPDATED_GUARD_DAYS + 30) * 24 * 60 * 60 * 1000
		)
			.toISOString()
			.slice(0, 10);

		const input = JSON.stringify([
			{
				slug: 'fresh-uncommitted-test-resource',
				title: 'Fresh Resource',
				link: 'https://example.com/fresh-uncommitted-test-resource',
				updated: today,
				tags: ['utilities'],
			},
			{
				slug: 'old-uncommitted-test-resource',
				title: 'Old Resource',
				link: 'https://example.com/old-uncommitted-test-resource',
				updated: veryOld,
				tags: ['utilities'],
			},
		]);

		const parsed = parseResourcesWithGitMetadata(input);
		assert.equal(parsed.length, 2);

		const [fresh, old] = parsed;
		assert.ok(fresh?.addedAt instanceof Date);
		assert.ok(fresh?.newUntil instanceof Date);
		const expectedWindowMs = NEW_RESOURCE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
		assert.equal(fresh.newUntil.getTime() - fresh.addedAt.getTime(), expectedWindowMs);

		assert.ok(old?.addedAt instanceof Date);
		assert.equal(old?.newUntil, null);
	});

	it('throws on non-array JSON input', () => {
		assert.throws(() => parseResourcesWithGitMetadata('{}'));
	});

	it('ensures resources.json has unique slugs, unique links, and valid tag/author references', () => {
		const resources = JSON.parse(
			readFileSync('src/content/resources.json', 'utf8')
		) as RawResource[];
		const tags = JSON.parse(readFileSync('src/content/tags.json', 'utf8')) as Record<
			string,
			{ title: string }
		>;
		const authorIds = new Set(
			readdirSync('src/content/authors')
				.filter((file) => file.endsWith('.json'))
				.map((file) => file.slice(0, -'.json'.length))
		);
		const validTagIds = new Set(Object.keys(tags));

		const seenSlugs = new Set<string>();
		const seenLinks = new Set<string>();

		assert.ok(resources.length > 0, 'Expected at least one resource');

		for (const resource of resources) {
			assert.equal(seenSlugs.has(resource.slug), false, `Duplicate slug: ${resource.slug}`);
			seenSlugs.add(resource.slug);

			assert.equal(seenLinks.has(resource.link), false, `Duplicate link: ${resource.link}`);
			seenLinks.add(resource.link);

			assert.doesNotThrow(() => new URL(resource.link), `Invalid URL: ${resource.link}`);
			assert.match(resource.updated, /^\d{4}-\d{2}-\d{2}$/, `Invalid date: ${resource.updated}`);

			assert.ok(resource.tags.length > 0, `Resource ${resource.slug} must have at least one tag`);
			for (const tag of resource.tags) {
				assert.equal(
					validTagIds.has(tag),
					true,
					`Unknown tag "${tag}" in resource "${resource.slug}"`
				);
			}

			for (const author of resource.authors ?? []) {
				assert.equal(
					authorIds.has(author),
					true,
					`Unknown author "${author}" in resource "${resource.slug}"`
				);
			}
		}
	});
});
