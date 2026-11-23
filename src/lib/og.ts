import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { type SatoriAstroOGOptions, satoriAstroOG } from 'satori-astro';
import sharp from 'sharp';
import logoDarkSvg from '../assets/logo-dark.svg?raw';
import { formatContributionSummary, getAllAuthorsWithCounts } from './authors';

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const SITE_TITLE = 'Astro Tips';
export const SITE_DESCRIPTION =
	'Astro best practices, tips, and recipes from the community — the place for content that goes beyond the official docs, for all Astronauts!';
export const SITE_HOST = 'astro-tips.dev';
export const THEME_COLOR = '#ae1c66';

export type OgEyebrowAccent = 'brand' | 'tip' | 'recipe' | 'directory' | 'author';

export interface OgCardData {
	slug: string;
	title: string;
	description: string;
	eyebrow: string;
	eyebrowAccent: OgEyebrowAccent;
	metaBadge?: string;
	footerLeft?: string;
}

const EYEBROW_STYLES: Record<
	OgEyebrowAccent,
	{ background: string; border: string; color: string; dot: string }
> = {
	brand: {
		background: 'rgba(174, 28, 102, 0.24)',
		border: 'rgba(240, 117, 181, 0.45)',
		color: '#f9d7e8',
		dot: '#f075b5',
	},
	recipe: {
		background: 'rgba(174, 28, 102, 0.24)',
		border: 'rgba(240, 117, 181, 0.48)',
		color: '#f9d7e8',
		dot: '#e34f99',
	},
	tip: {
		background: 'rgba(227, 79, 153, 0.18)',
		border: 'rgba(240, 117, 181, 0.42)',
		color: '#f9d7e8',
		dot: '#f075b5',
	},
	directory: {
		background: 'rgba(252, 200, 154, 0.14)',
		border: 'rgba(252, 200, 154, 0.42)',
		color: '#fcc89a',
		dot: '#fcc89a',
	},
	author: {
		background: 'rgba(242, 203, 216, 0.14)',
		border: 'rgba(242, 203, 216, 0.36)',
		color: '#f2cbd8',
		dot: '#f2cbd8',
	},
};

const require = createRequire(import.meta.url);

interface LoadedAssets {
	fonts: {
		name: string;
		data: Buffer;
		weight: 400 | 500 | 600 | 700 | 800;
		style: 'normal';
	}[];
	logoDataUri: string;
}

interface SatoriVNode {
	type: string;
	props: Record<string, unknown>;
}

type SatoriChild = SatoriVNode | string | null | undefined | false;

function el(type: string, props: Record<string, unknown>, ...children: SatoriChild[]): SatoriVNode {
	const filtered = children.filter(
		(child): child is SatoriVNode | string =>
			child !== null && child !== undefined && child !== false
	);
	if (filtered.length === 0) {
		return { type, props };
	}
	return {
		type,
		props: {
			...props,
			children: filtered.length === 1 ? filtered[0] : filtered,
		},
	};
}

let cachedAssetsPromise: Promise<LoadedAssets> | undefined;

function loadAssets(): Promise<LoadedAssets> {
	if (!cachedAssetsPromise) {
		cachedAssetsPromise = (async () => {
			const [regular, medium, semibold, bold, extrabold, logoPng] = await Promise.all([
				readFile(require.resolve('@fontsource/inter/files/inter-latin-400-normal.woff')),
				readFile(require.resolve('@fontsource/inter/files/inter-latin-500-normal.woff')),
				readFile(require.resolve('@fontsource/inter/files/inter-latin-600-normal.woff')),
				readFile(require.resolve('@fontsource/inter/files/inter-latin-700-normal.woff')),
				readFile(require.resolve('@fontsource/inter/files/inter-latin-800-normal.woff')),
				sharp(Buffer.from(logoDarkSvg)).resize({ height: 96 }).png().toBuffer(),
			]);

			return {
				fonts: [
					{ name: 'Inter', data: regular, weight: 400, style: 'normal' },
					{ name: 'Inter', data: medium, weight: 500, style: 'normal' },
					{ name: 'Inter', data: semibold, weight: 600, style: 'normal' },
					{ name: 'Inter', data: bold, weight: 700, style: 'normal' },
					{ name: 'Inter', data: extrabold, weight: 800, style: 'normal' },
				],
				logoDataUri: `data:image/png;base64,${logoPng.toString('base64')}`,
			};
		})();
	}
	return cachedAssetsPromise;
}

export function normalizeOgSlug(id: string): string {
	const cleaned = id.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
	if (cleaned === '' || cleaned === 'index') {
		return 'index';
	}
	return cleaned;
}

function truncateText(value: string, maxLength: number): string {
	const normalized = value.replace(/\s+/g, ' ').trim();
	if (normalized.length <= maxLength) {
		return normalized;
	}
	const slice = normalized.slice(0, maxLength - 1);
	const lastSpace = slice.lastIndexOf(' ');
	const trimmed = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;
	return `${trimmed.replace(/[.,;:!?-]+$/, '')}…`;
}

function formatAuthorNames(names: string[]): string | undefined {
	if (names.length === 0) {
		return undefined;
	}
	if (names.length === 1) {
		return `By ${names[0]}`;
	}
	if (names.length === 2) {
		return `By ${names[0]} & ${names[1]}`;
	}
	return `By ${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

function getTitleFontSize(title: string): number {
	if (title.length <= 26) {
		return 68;
	}
	if (title.length <= 44) {
		return 58;
	}
	if (title.length <= 64) {
		return 50;
	}
	return 44;
}

export async function getOgCards(): Promise<OgCardData[]> {
	const [allDocs, allResources, authorsWithCounts] = await Promise.all([
		getCollection('docs'),
		getCollection('resources'),
		getAllAuthorsWithCounts(),
	]);

	const recipeCount = allDocs.filter((doc) => doc.id.startsWith('recipes/')).length;
	const tipCount = allDocs.filter((doc) => doc.id.startsWith('tips/')).length;
	const resourceCount = allResources.length;
	const statsSummary = `${recipeCount} recipes · ${tipCount} tips · ${resourceCount} resources`;
	const authorNameById = new Map(authorsWithCounts.map(({ author }) => [author.id, author.name]));

	const cards: OgCardData[] = [];

	for (const doc of allDocs) {
		const slug = normalizeOgSlug(doc.id);
		const description = doc.data.description ?? SITE_DESCRIPTION;

		if (slug === 'index') {
			cards.push({
				slug: 'index',
				eyebrow: 'Community Knowledge Base',
				eyebrowAccent: 'brand',
				title: 'Go beyond the official Astro docs',
				description,
				footerLeft: statsSummary,
			});
			continue;
		}

		const authorNames = (doc.data.authors ?? [])
			.map((ref) => authorNameById.get(ref.id))
			.filter((name): name is string => Boolean(name));
		const authorLine = formatAuthorNames(authorNames);
		const metaBadge = doc.data.astroRange ? `Astro ${doc.data.astroRange}` : undefined;

		let eyebrow = 'Guide';
		let eyebrowAccent: OgEyebrowAccent = 'brand';
		if (slug.startsWith('recipes/')) {
			eyebrow = 'Recipe';
			eyebrowAccent = 'recipe';
		} else if (slug.startsWith('tips/')) {
			eyebrow = 'Tip';
			eyebrowAccent = 'tip';
		}

		const card: OgCardData = {
			slug,
			eyebrow,
			eyebrowAccent,
			title: doc.data.title,
			description,
		};
		if (metaBadge !== undefined) {
			card.metaBadge = metaBadge;
		}
		if (authorLine !== undefined) {
			card.footerLeft = authorLine;
		}
		cards.push(card);
	}

	cards.push({
		slug: 'external-resources',
		eyebrow: 'Directory',
		eyebrowAccent: 'directory',
		title: 'External resources',
		description:
			'Community-written Astro tutorials, recipes, guides, and deep dives from across the web.',
		metaBadge: `${resourceCount} resources`,
		footerLeft: 'Curated by the Astro community',
	});

	cards.push({
		slug: 'authors',
		eyebrow: 'Community',
		eyebrowAccent: 'author',
		title: 'Authors',
		description: 'Meet the community contributors behind Astro Tips.',
		metaBadge: `${authorsWithCounts.length} contributors`,
		footerLeft: statsSummary,
	});

	for (const { author, counts } of authorsWithCounts) {
		cards.push({
			slug: `authors/${author.id}`,
			eyebrow: 'Author',
			eyebrowAccent: 'author',
			title: author.name,
			description: author.bio ?? `Contributions by ${author.name} on Astro Tips.`,
			footerLeft: formatContributionSummary(counts),
		});
	}

	return cards;
}

let cachedOgSlugSetPromise: Promise<Set<string>> | undefined;

async function computeOgSlugSet(): Promise<Set<string>> {
	const [allDocs, allAuthors] = await Promise.all([
		getCollection('docs'),
		getCollection('authors'),
	]);

	const slugs = new Set<string>(['external-resources', 'authors']);
	for (const doc of allDocs) {
		slugs.add(normalizeOgSlug(doc.id));
	}
	for (const author of allAuthors) {
		slugs.add(`authors/${author.id}`);
	}
	return slugs;
}

export async function getOgSlugSet(): Promise<Set<string>> {
	if (import.meta.env.PROD) {
		if (!cachedOgSlugSetPromise) {
			cachedOgSlugSetPromise = computeOgSlugSet();
		}
		return cachedOgSlugSetPromise;
	}
	return computeOgSlugSet();
}

export async function renderOgImageResponse(card: OgCardData): Promise<Response> {
	const { fonts, logoDataUri } = await loadAssets();
	const eyebrowStyle = EYEBROW_STYLES[card.eyebrowAccent];
	const titleFontSize = getTitleFontSize(card.title);
	const title = truncateText(card.title, 92);
	const description = truncateText(card.description, 155);
	const eyebrow = card.eyebrow.toUpperCase();
	const footerLeft = card.footerLeft ?? 'Community tips & recipes for Astronauts';

	const template = el(
		'div',
		{
			style: {
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
				backgroundImage: 'linear-gradient(135deg, #131118 0%, #17181c 58%, #211420 100%)',
				color: '#fafafa',
				fontFamily: 'Inter',
				position: 'relative',
				overflow: 'hidden',
			},
		},
		el('div', {
			style: {
				display: 'flex',
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				height: 8,
				backgroundImage:
					'linear-gradient(90deg, #ae1c66 0%, #e34f99 48%, #f075b5 78%, #fcc89a 100%)',
			},
		}),
		el('div', {
			style: {
				display: 'flex',
				position: 'absolute',
				top: -180,
				right: -140,
				width: 560,
				height: 560,
				borderRadius: 9999,
				backgroundImage:
					'radial-gradient(circle, rgba(227, 79, 153, 0.28) 0%, rgba(174, 28, 102, 0.12) 45%, rgba(23, 24, 28, 0) 72%)',
			},
		}),
		el('div', {
			style: {
				display: 'flex',
				position: 'absolute',
				bottom: -220,
				left: -120,
				width: 480,
				height: 480,
				borderRadius: 9999,
				backgroundImage:
					'radial-gradient(circle, rgba(174, 28, 102, 0.2) 0%, rgba(23, 24, 28, 0) 70%)',
			},
		}),
		el(
			'div',
			{
				style: {
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					width: '100%',
					height: '100%',
					padding: '56px 68px 48px 68px',
					position: 'relative',
				},
			},
			el(
				'div',
				{
					style: {
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						width: '100%',
					},
				},
				el('img', {
					src: logoDataUri,
					style: {
						display: 'flex',
						width: 232,
						height: 48,
					},
				}),
				el(
					'div',
					{
						style: {
							display: 'flex',
							alignItems: 'center',
							gap: 12,
						},
					},
					card.metaBadge
						? el(
								'div',
								{
									style: {
										display: 'flex',
										alignItems: 'center',
										padding: '10px 18px',
										borderRadius: 9999,
										backgroundColor: 'rgba(255, 255, 255, 0.06)',
										border: '1px solid rgba(255, 255, 255, 0.16)',
										color: '#c0c2c7',
										fontSize: 18,
										fontWeight: 600,
									},
								},
								card.metaBadge
							)
						: null,
					el(
						'div',
						{
							style: {
								display: 'flex',
								alignItems: 'center',
								gap: 10,
								padding: '10px 20px',
								borderRadius: 9999,
								backgroundColor: eyebrowStyle.background,
								border: `1px solid ${eyebrowStyle.border}`,
								color: eyebrowStyle.color,
								fontSize: 18,
								fontWeight: 700,
								letterSpacing: '0.08em',
							},
						},
						el('div', {
							style: {
								display: 'flex',
								width: 10,
								height: 10,
								borderRadius: 9999,
								backgroundColor: eyebrowStyle.dot,
							},
						}),
						el('span', {}, eyebrow)
					)
				)
			),
			el(
				'div',
				{
					style: {
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						flex: 1,
						gap: 22,
						paddingTop: 12,
						paddingBottom: 12,
					},
				},
				el(
					'div',
					{
						style: {
							display: 'flex',
							fontSize: titleFontSize,
							fontWeight: 800,
							lineHeight: 1.12,
							letterSpacing: '-0.03em',
							color: '#fafafa',
						},
					},
					title
				),
				el(
					'div',
					{
						style: {
							display: 'flex',
							fontSize: 27,
							fontWeight: 400,
							lineHeight: 1.42,
							color: '#c0c2c7',
							maxWidth: 980,
						},
					},
					description
				)
			),
			el(
				'div',
				{
					style: {
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						width: '100%',
						paddingTop: 24,
						borderTop: '1px solid rgba(242, 203, 216, 0.16)',
					},
				},
				el(
					'div',
					{
						style: {
							display: 'flex',
							alignItems: 'center',
							gap: 12,
							fontSize: 22,
							fontWeight: 500,
							color: '#f2cbd8',
						},
					},
					el('span', {}, footerLeft)
				),
				el(
					'div',
					{
						style: {
							display: 'flex',
							alignItems: 'center',
							fontSize: 22,
							fontWeight: 600,
							color: '#f075b5',
							letterSpacing: '0.01em',
						},
					},
					SITE_HOST
				)
			)
		)
	) as unknown as SatoriAstroOGOptions['template'];

	return await satoriAstroOG({
		template,
		width: OG_IMAGE_WIDTH,
		height: OG_IMAGE_HEIGHT,
	}).toResponse({
		satori: {
			fonts,
		},
	});
}
