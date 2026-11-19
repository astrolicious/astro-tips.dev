import { type CollectionEntry, getCollection } from 'astro:content';
import { type ResolvedAuthor, resolveAuthor } from './authors';

export interface ResourceTag {
	id: string;
	title: string;
}

export interface ResourceTagWithCount extends ResourceTag {
	count: number;
}

export interface ResolvedResource {
	id: string;
	slug: string;
	title: string;
	link: string;
	domain: string;
	description?: string;
	updated: Date;
	updatedIso: string;
	updatedLabel: string;
	addedAt: Date;
	newUntil: Date | null;
	newUntilIso: string | null;
	isNewAtBuild: boolean;
	tags: ResourceTag[];
	authors: ResolvedAuthor[];
}

export interface ResourceExplorerData {
	resources: ResolvedResource[];
	tags: ResourceTagWithCount[];
	latestNewUntilIso: string | null;
	newCountAtBuild: number;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC',
});

export function getResourceHostname(url: string): string {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
}

export function formatResourceDate(date: Date): string {
	return DATE_FORMATTER.format(date);
}

export function resolveResourceEntry(
	entry: CollectionEntry<'resources'>,
	tagMap: Map<string, ResourceTag>,
	authorMap: Map<string, ResolvedAuthor>,
	nowMs: number
): ResolvedResource {
	const { slug, title, link, description, updated, addedAt, newUntil, tags, authors } = entry.data;
	const resolvedAddedAt = addedAt ?? updated;
	const resolvedNewUntil = newUntil ?? null;
	const isNewAtBuild = resolvedNewUntil !== null && resolvedNewUntil.getTime() >= nowMs;

	const resolvedTags: ResourceTag[] = tags.map((tagRef) => {
		return tagMap.get(tagRef.id) ?? { id: tagRef.id, title: tagRef.id };
	});

	const resolvedAuthors: ResolvedAuthor[] = [];
	for (const authorRef of authors ?? []) {
		const author = authorMap.get(authorRef.id);
		if (author) {
			resolvedAuthors.push(author);
		}
	}

	const resolved: ResolvedResource = {
		id: entry.id,
		slug,
		title,
		link,
		domain: getResourceHostname(link),
		updated,
		updatedIso: updated.toISOString().slice(0, 10),
		updatedLabel: formatResourceDate(updated),
		addedAt: resolvedAddedAt,
		newUntil: resolvedNewUntil,
		newUntilIso: resolvedNewUntil ? resolvedNewUntil.toISOString() : null,
		isNewAtBuild,
		tags: resolvedTags,
		authors: resolvedAuthors,
	};

	if (description !== undefined) {
		resolved.description = description;
	}

	return resolved;
}

export function compareResourcesNewestFirst(a: ResolvedResource, b: ResolvedResource): number {
	if (a.isNewAtBuild !== b.isNewAtBuild) {
		return a.isNewAtBuild ? -1 : 1;
	}
	const updatedDiff = b.updated.getTime() - a.updated.getTime();
	if (updatedDiff !== 0) {
		return updatedDiff;
	}
	const addedDiff = b.addedAt.getTime() - a.addedAt.getTime();
	if (addedDiff !== 0) {
		return addedDiff;
	}
	return a.title.localeCompare(b.title);
}

export async function getResolvedResources(): Promise<ResourceExplorerData> {
	const [allResources, allTags, allAuthors] = await Promise.all([
		getCollection('resources'),
		getCollection('tags'),
		getCollection('authors'),
	]);

	const tagMap = new Map<string, ResourceTag>();
	for (const tag of allTags) {
		tagMap.set(tag.id, { id: tag.id, title: tag.data.title });
	}

	const authorMap = new Map<string, ResolvedAuthor>();
	for (const author of allAuthors) {
		authorMap.set(author.id, resolveAuthor(author));
	}

	const nowMs = Date.now();
	const countsByTag = new Map<string, number>();
	let latestNewUntilMs = 0;
	let newCountAtBuild = 0;

	const resources = allResources
		.map((entry) => {
			const resolved = resolveResourceEntry(entry, tagMap, authorMap, nowMs);
			for (const tag of resolved.tags) {
				countsByTag.set(tag.id, (countsByTag.get(tag.id) ?? 0) + 1);
			}
			if (resolved.isNewAtBuild && resolved.newUntil) {
				newCountAtBuild += 1;
				const ms = resolved.newUntil.getTime();
				if (ms > latestNewUntilMs) {
					latestNewUntilMs = ms;
				}
			}
			return resolved;
		})
		.sort(compareResourcesNewestFirst);

	const tags: ResourceTagWithCount[] = allTags
		.map((tag) => ({
			id: tag.id,
			title: tag.data.title,
			count: countsByTag.get(tag.id) ?? 0,
		}))
		.filter((tag) => tag.count > 0)
		.sort((a, b) => a.title.localeCompare(b.title));

	return {
		resources,
		tags,
		latestNewUntilIso: latestNewUntilMs > 0 ? new Date(latestNewUntilMs).toISOString() : null,
		newCountAtBuild,
	};
}

export async function resolveResourcesByEntries(
	entries: CollectionEntry<'resources'>[]
): Promise<ResolvedResource[]> {
	if (entries.length === 0) {
		return [];
	}

	const [allTags, allAuthors] = await Promise.all([
		getCollection('tags'),
		getCollection('authors'),
	]);

	const tagMap = new Map<string, ResourceTag>();
	for (const tag of allTags) {
		tagMap.set(tag.id, { id: tag.id, title: tag.data.title });
	}

	const authorMap = new Map<string, ResolvedAuthor>();
	for (const author of allAuthors) {
		authorMap.set(author.id, resolveAuthor(author));
	}

	const nowMs = Date.now();
	return entries
		.map((entry) => resolveResourceEntry(entry, tagMap, authorMap, nowMs))
		.sort(compareResourcesNewestFirst);
}

export async function getLatestResourceNewUntil(): Promise<string | null> {
	const allResources = await getCollection('resources');
	const nowMs = Date.now();
	let latestMs = 0;

	for (const resource of allResources) {
		const newUntil = resource.data.newUntil;
		if (!newUntil) {
			continue;
		}
		const ms = newUntil.getTime();
		if (ms >= nowMs && ms > latestMs) {
			latestMs = ms;
		}
	}

	return latestMs > 0 ? new Date(latestMs).toISOString() : null;
}
