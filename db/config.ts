import { defineDb, defineTable, column, sql } from 'astro:db';


const Authors = defineTable({
  columns: {
    slug: column.text({ primaryKey: true }),
    // id: column.text({ unique: true, default: sql`uuid()` }),
    name: column.text(),
    title: column.text({ optional: true }),
    picture: column.text({ optional: true }),
    url: column.text({ optional: true })
  }
})

// https://astro.build/db/config
export default defineDb({
  tables: { Authors }
});
