import { type CollectionEntry, getCollection, getEntries } from 'astro:content';
import type { Icon } from '@astrojs/starlight/components';
import type { ComponentProps } from 'astro/types';

type StarlightIconName = ComponentProps<typeof Icon>['name'];

export interface AuthorLink {
	label: string;
	href: string;
	icon: StarlightIconName;
}

export interface ResolvedAuthor {
	id: string;
	name: string;
	bio?: string;
	avatarUrl?: string;
	initials: string;
	website?: string;
	github?: string;
	href: string;
	links: AuthorLink[];
}

export interface AuthorContributions {
	recipes: CollectionEntry<'docs'>[];
	tips: CollectionEntry<'docs'>[];
	resources: CollectionEntry<'resources'>[];
	total: number;
}

export interface AuthorWithCounts {
	author: ResolvedAuthor;
	counts: {
		recipes: number;
		tips: number;
		resources: number;
		total: number;
	};
}

const SOCIAL_META: Record<string, { label: string; icon: StarlightIconName }> = {
	bluesky: { label: 'Bluesky', icon: 'blueSky' },
	x: { label: 'X', icon: 'x.com' },
	mastodon: { label: 'Mastodon', icon: 'mastodon' },
	linkedin: { label: 'LinkedIn', icon: 'linkedin' },
	youtube: { label: 'YouTube', icon: 'youtube' },
	discord: { label: 'Discord', icon: 'discord' },
	twitch: { label: 'Twitch', icon: 'twitch' },
	threads: { label: 'Threads', icon: 'threads' },
	instagram: { label: 'Instagram', icon: 'instagram' },
	gitlab: { label: 'GitLab', icon: 'gitlab' },
	codeberg: { label: 'Codeberg', icon: 'codeberg' },
	codepen: { label: 'CodePen', icon: 'codePen' },
	rss: { label: 'RSS', icon: 'rss' },
};

export function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) {
		return '?';
	}
	const first = parts[0]?.[0] ?? '';
	if (parts.length === 1) {
		return first.toUpperCase();
	}
	const last = parts[parts.length - 1]?.[0] ?? '';
	return `${first}${last}`.toUpperCase();
}

export function getDisplayDomain(url: string): string {
	try {
		const parsed = new URL(url);
		const pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
		return `${parsed.hostname.replace(/^www\./, '')}${pathname}`;
	} catch {
		return url;
	}
}

export function resolveAuthor(entry: CollectionEntry<'authors'>): ResolvedAuthor {
	const { name, github, avatar, bio, website, socials } = entry.data;
	const avatarUrl =
		avatar ??
		(github ? `https://github.com/${encodeURIComponent(github)}.png?size=200` : undefined);

	const links: AuthorLink[] = [];

	if (github) {
		links.push({
			label: 'GitHub',
			href: `https://github.com/${encodeURIComponent(github)}`,
			icon: 'github',
		});
	}

	if (socials) {
		for (const [key, href] of Object.entries(socials)) {
			if (!href) {
				continue;
			}
			const meta = SOCIAL_META[key];
			if (meta) {
				links.push({
					label: meta.label,
					href,
					icon: meta.icon,
				});
			}
		}
	}

	const resolved: ResolvedAuthor = {
		id: entry.id,
		name,
		initials: getInitials(name),
		href: `/authors/${entry.id}`,
		links,
	};

	if (bio !== undefined) {
		resolved.bio = bio;
	}
	if (avatarUrl !== undefined) {
		resolved.avatarUrl = avatarUrl;
	}
	if (website !== undefined) {
		resolved.website = website;
	}
	if (github !== undefined) {
		resolved.github = github;
	}

	return resolved;
}

export async function resolveAuthors(
	refs: CollectionEntry<'docs'>['data']['authors']
): Promise<ResolvedAuthor[]> {
	if (!refs || refs.length === 0) {
		return [];
	}
	const entries = await getEntries(refs);
	return entries.map(resolveAuthor);
}

export async function getAuthorContributions(authorId: string): Promise<AuthorContributions> {
	const [allDocs, allResources] = await Promise.all([
		getCollection('docs'),
		getCollection('resources'),
	]);

	const recipes: CollectionEntry<'docs'>[] = [];
	const tips: CollectionEntry<'docs'>[] = [];

	for (const doc of allDocs) {
		const isAuthor = doc.data.authors?.some((ref) => ref.id === authorId) ?? false;
		if (!isAuthor) {
			continue;
		}
		if (doc.id.startsWith('recipes/')) {
			recipes.push(doc);
		} else if (doc.id.startsWith('tips/')) {
			tips.push(doc);
		}
	}

	recipes.sort((a, b) => a.data.title.localeCompare(b.data.title));
	tips.sort((a, b) => a.data.title.localeCompare(b.data.title));

	const resources = allResources
		.filter((resource) => resource.data.authors?.some((ref) => ref.id === authorId) ?? false)
		.sort((a, b) => b.data.updated.getTime() - a.data.updated.getTime());

	return {
		recipes,
		tips,
		resources,
		total: recipes.length + tips.length + resources.length,
	};
}

export async function getAllAuthorsWithCounts(): Promise<AuthorWithCounts[]> {
	const [allAuthors, allDocs, allResources] = await Promise.all([
		getCollection('authors'),
		getCollection('docs'),
		getCollection('resources'),
	]);

	const countsByAuthor = new Map<string, { recipes: number; tips: number; resources: number }>();
	const getOrCreate = (id: string) => {
		let entry = countsByAuthor.get(id);
		if (!entry) {
			entry = { recipes: 0, tips: 0, resources: 0 };
			countsByAuthor.set(id, entry);
		}
		return entry;
	};

	for (const doc of allDocs) {
		const isRecipe = doc.id.startsWith('recipes/');
		const isTip = doc.id.startsWith('tips/');
		if (!isRecipe && !isTip) {
			continue;
		}
		for (const ref of doc.data.authors ?? []) {
			const counts = getOrCreate(ref.id);
			if (isRecipe) {
				counts.recipes += 1;
			} else if (isTip) {
				counts.tips += 1;
			}
		}
	}

	for (const resource of allResources) {
		for (const ref of resource.data.authors ?? []) {
			const counts = getOrCreate(ref.id);
			counts.resources += 1;
		}
	}

	return allAuthors
		.map((entry) => {
			const counts = countsByAuthor.get(entry.id) ?? { recipes: 0, tips: 0, resources: 0 };
			return {
				author: resolveAuthor(entry),
				counts: {
					...counts,
					total: counts.recipes + counts.tips + counts.resources,
				},
			};
		})
		.sort((a, b) => {
			if (b.counts.total !== a.counts.total) {
				return b.counts.total - a.counts.total;
			}
			return a.author.name.localeCompare(b.author.name);
		});
}

export function formatContributionSummary(counts: {
	recipes: number;
	tips: number;
	resources: number;
	total: number;
}): string {
	if (counts.total === 0) {
		return 'No contributions yet';
	}

	const parts: string[] = [];
	if (counts.recipes > 0) {
		parts.push(`${counts.recipes} ${counts.recipes === 1 ? 'recipe' : 'recipes'}`);
	}
	if (counts.tips > 0) {
		parts.push(`${counts.tips} ${counts.tips === 1 ? 'tip' : 'tips'}`);
	}
	if (counts.resources > 0) {
		parts.push(
			`${counts.resources} ${counts.resources === 1 ? 'external resource' : 'external resources'}`
		);
	}
	return parts.join(' · ');
}
