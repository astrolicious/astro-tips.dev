import { getEntries } from 'astro:content';
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { normalizeOgSlug, SITE_TITLE } from '../lib/og';

const DEFAULT_SITE = new URL('https://astro-tips.dev');

/**
 * Adds schema.org JSON-LD to every Starlight page: `WebSite` + `Organization` on the
 * homepage, and `TechArticle` + `BreadcrumbList` on content pages.
 */
export const onRequest = defineRouteMiddleware(async (context) => {
	const { entry, head, id, siteDescription } = context.locals.starlightRoute;
	const site = context.site ?? DEFAULT_SITE;
	const siteUrl = new URL('/', site).href;
	const slug = normalizeOgSlug(id);
	const pageUrl = new URL(context.url.pathname, site).href;

	const publisher = {
		'@type': 'Organization',
		'@id': `${siteUrl}#organization`,
		name: SITE_TITLE,
		url: siteUrl,
		logo: new URL('/favicon.svg', site).href,
		sameAs: ['https://github.com/astrolicious/astro-tips.dev'],
	};

	const graph: Record<string, unknown>[] = [];

	if (slug === 'index') {
		graph.push(publisher, {
			'@type': 'WebSite',
			'@id': `${siteUrl}#website`,
			name: SITE_TITLE,
			url: siteUrl,
			description: siteDescription,
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
			graph.push({
				'@type': 'TechArticle',
				headline: entry.data.title,
				description: entry.data.description,
				url: pageUrl,
				mainEntityOfPage: pageUrl,
				inLanguage: 'en',
				image: new URL(`/og/${slug}.png`, site).href,
				about: { '@type': 'SoftwareApplication', name: 'Astro', url: 'https://astro.build' },
				author: authors.map((author) => ({
					'@type': 'Person',
					name: author.data.name,
					url: new URL(`/authors/${author.id}/`, site).href,
				})),
				publisher,
				isPartOf: { '@type': 'WebSite', name: SITE_TITLE, url: siteUrl },
			});
		}
	}

	head.push({
		tag: 'script',
		attrs: { type: 'application/ld+json' },
		content: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
	});
});
