import { getEntries, getEntry } from 'astro:content';
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { resolveAuthor } from '../lib/authors';
import { normalizeOgSlug, SITE_DESCRIPTION, SITE_TITLE } from '../lib/og';

const DEFAULT_SITE = new URL('https://astro-tips.dev');

function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Adds schema.org JSON-LD to Starlight pages:
 * - `Organization` + `WebSite` on the homepage
 * - `BreadcrumbList` + `TechArticle` on tips, recipes, and guides
 * - `BreadcrumbList` + `ProfilePage` (`Person`) on author profiles
 * - `BreadcrumbList` + `CollectionPage` on directory pages
 * Skips 404 error pages.
 */
export const onRequest = defineRouteMiddleware(async (context) => {
	const { entry, head, id, lastUpdated } = context.locals.starlightRoute;
	const slug = normalizeOgSlug(id);

	if (slug === '404') {
		return;
	}

	const site = context.site ?? DEFAULT_SITE;
	const siteUrl = new URL('/', site).href;
	const pageUrl = new URL(context.url.pathname, site).href;

	const publisher = {
		'@type': 'Organization',
		'@id': `${siteUrl}#organization`,
		name: SITE_TITLE,
		url: siteUrl,
		logo: new URL('/favicon.svg', site).href,
		sameAs: ['https://github.com/astrolicious/astro-tips.dev'],
	};

	const websiteRef = {
		'@type': 'WebSite',
		'@id': `${siteUrl}#website`,
		name: SITE_TITLE,
		url: siteUrl,
	};

	const graph: Record<string, unknown>[] = [];

	if (slug === 'index') {
		graph.push(publisher, {
			'@type': 'WebSite',
			'@id': `${siteUrl}#website`,
			name: SITE_TITLE,
			url: siteUrl,
			description: entry.data.description ?? SITE_DESCRIPTION,
			inLanguage: 'en',
			publisher: { '@id': `${siteUrl}#organization` },
		});
	} else {
		const crumbs: { name: string; url: string }[] = [{ name: SITE_TITLE, url: siteUrl }];
		// Only sections with their own index page get an intermediate crumb.
		if (slug.startsWith('authors/')) {
			crumbs.push({ name: 'Authors', url: new URL('/authors/', site).href });
		}
		crumbs.push({ name: entry.data.title, url: pageUrl });

		graph.push({
			'@type': 'BreadcrumbList',
			itemListElement: crumbs.map((crumb, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: crumb.name,
				item: crumb.url,
			})),
		});

		const isArticle =
			slug.startsWith('tips/') || slug.startsWith('recipes/') || slug === 'best-practices';

		if (isArticle) {
			const authors = entry.data.authors ? await getEntries(entry.data.authors) : [];
			const article: Record<string, unknown> = {
				'@type': 'TechArticle',
				headline: entry.data.title,
				description: entry.data.description,
				url: pageUrl,
				mainEntityOfPage: pageUrl,
				inLanguage: 'en',
				image: new URL(`/og/${slug}.png`, site).href,
				about: { '@type': 'SoftwareApplication', name: 'Astro', url: 'https://astro.build' },
				publisher,
				isPartOf: websiteRef,
			};
			if (authors.length > 0) {
				article.author = authors.map((author) => ({
					'@type': 'Person',
					name: author.data.name,
					url: new URL(`/authors/${author.id}/`, site).href,
				}));
			}
			if (lastUpdated) {
				article.dateModified = lastUpdated.toISOString();
			}
			graph.push(article);
		} else if (slug.startsWith('authors/')) {
			const authorId = slug.slice('authors/'.length);
			const authorEntry = await getEntry('authors', authorId);
			if (authorEntry) {
				const author = resolveAuthor(authorEntry);
				const sameAs = [
					...(author.website ? [author.website] : []),
					...author.links.map((link) => link.href),
				];
				const person: Record<string, unknown> = {
					'@type': 'Person',
					name: author.name,
					url: pageUrl,
				};
				if (author.bio) {
					person.description = author.bio;
				}
				if (author.avatarUrl) {
					person.image = author.avatarUrl;
				}
				if (sameAs.length > 0) {
					person.sameAs = sameAs;
				}
				graph.push({
					'@type': 'ProfilePage',
					url: pageUrl,
					name: author.name,
					inLanguage: 'en',
					mainEntity: person,
					isPartOf: websiteRef,
				});
			}
		} else if (slug === 'external-resources' || slug === 'authors') {
			graph.push({
				'@type': 'CollectionPage',
				name: entry.data.title,
				description: entry.data.description,
				url: pageUrl,
				inLanguage: 'en',
				isPartOf: websiteRef,
			});
		}
	}

	head.push({
		tag: 'script',
		attrs: { type: 'application/ld+json' },
		content: serializeJsonLd({ '@context': 'https://schema.org', '@graph': graph }),
	});
});
