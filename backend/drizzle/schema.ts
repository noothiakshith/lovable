// Drizzle ORM Schema
// Equivalent to Prisma schema.prisma

import { pgTable, uuid, text, integer, timestamp, primaryKey, pgSchema } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  credits: integer('credits').notNull().default(20),
});

// Project Table
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  sandboxId: text('sandbox_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// File Table
export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  path: text('path').notNull(),
  content: text('content').notNull(),
}, (table) => {
  return {
    uniqueProjectPath: primaryKey({ columns: [table.projectId, table.path] }),
  };
});

// Relations
// User -> Projects (One-to-Many)
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

// Project -> User (Many-to-One)
export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  files: many(files),
}));

// File -> Project (Many-to-One)
export const filesRelations = relations(files, ({ one }) => ({
  project: one(projects, {
    fields: [files.projectId],
    references: [projects.id],
  }),
}));

// Export all tables and relations
export { users, projects, files, usersRelations, projectsRelations, filesRelations };