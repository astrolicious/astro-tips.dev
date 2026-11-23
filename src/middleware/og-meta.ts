import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import {
	getOgSlugSet,
	normalizeOgSlug,
	OG_IMAGE_HEIGHT,
	OG_IMAGE_WIDTH,
	SITE_DESCRIPTION,
} from '../lib/og';

const DEFAULT_SITE = new URL('https://astro-tips.dev');

export const onRequest = defineRouteMiddleware(async (context) => {
	const { entry, head, id, siteTitle } = context.locals.starlightRoute;
	const slug = normalizeOgSlug(id);
	const isNotFound = slug === '404';

	if (isNotFound) {
		head.push({
			tag: 'meta',
			attrs: {
				name: 'robots',
				content: 'noindex',
			},
		});
	}

	const ogTypeEntry = head.find(
		(item) => item.tag === 'meta' && item.attrs?.property === 'og:type'
	);
	if (ogTypeEntry?.attrs) {
		if (slug === 'index' || slug === 'external-resources' || slug === 'authors' || isNotFound) {
			ogTypeEntry.attrs.content = 'website';
		} else if (slug.startsWith('authors/')) {
			ogTypeEntry.attrs.content = 'profile';
		}
	}

	const hasCustomOgImage = head.some(
		(item) => item.tag === 'meta' && item.attrs?.property === 'og:image'
	);
	if (hasCustomOgImage) {
		return;
	}

	const validSlugs = await getOgSlugSet();
	const imageSlug = validSlugs.has(slug) ? slug : 'index';
	const site = context.site ?? DEFAULT_SITE;
	const ogImageUrl = new URL(`/og/${imageSlug}.png`, site).href;
	const imageAlt =
		imageSlug === 'index'
			? `${siteTitle} — ${SITE_DESCRIPTION}`
			: `${entry.data.title} — ${siteTitle}`;

	head.push(
		{
			tag: 'meta',
			attrs: {
				property: 'og:image',
				content: ogImageUrl,
			},
		},
		{
			tag: 'meta',
			attrs: {
				property: 'og:image:width',
				content: String(OG_IMAGE_WIDTH),
			},
		},
		{
			tag: 'meta',
			attrs: {
				property: 'og:image:height',
				content: String(OG_IMAGE_HEIGHT),
			},
		},
		{
			tag: 'meta',
			attrs: {
				property: 'og:image:type',
				content: 'image/png',
			},
		},
		{
			tag: 'meta',
			attrs: {
				property: 'og:image:alt',
				content: imageAlt,
			},
		},
		{
			tag: 'meta',
			attrs: {
				name: 'twitter:image',
				content: ogImageUrl,
			},
		},
		{
			tag: 'meta',
			attrs: {
				name: 'twitter:image:alt',
				content: imageAlt,
			},
		}
	);
});
