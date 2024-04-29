import { Authors, db } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	await db.insert(Authors).values([{ slug: 'alexanderniebuhr', name: 'Alexander Niebuhr' }]);
}
