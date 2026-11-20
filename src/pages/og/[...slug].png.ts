import type { APIRoute, GetStaticPaths } from 'astro';
import { getOgCards, type OgCardData, renderOgImageResponse } from '~/lib/og';

export const getStaticPaths = (async () => {
	const cards = await getOgCards();
	return cards.map((card) => ({
		params: { slug: card.slug },
		props: { card },
	}));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
	return await renderOgImageResponse((props as { card: OgCardData }).card);
};
