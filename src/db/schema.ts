import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  real,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

export const locationTypeEnum = pgEnum('location_type', [
  'state',
  'city',
  'neighborhood',
]);

export const propertyTypeEnum = pgEnum('property_type', ['sale', 'rent']);

export const propertyCategoryEnum = pgEnum('property_category', [
  'house',
  'apartment',
  'office',
  'land',
  'store',
  'warehouse',
  'penthouse',
  'object',
]);

export const propertyStatusEnum = pgEnum('property_status', [
  'active',
  'pending',
  'sold',
  'rented',
]);

export const propertyRequestTypeEnum = pgEnum('property_request_type', [
  'buy',
  'rent',
]);

// ──────────────────────────────────────────────
// Tables
// ──────────────────────────────────────────────

// Locations (self-referencing: state -> city -> neighborhood)
export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  type: locationTypeEnum('type').notNull(),
  name_al: varchar('name_al', { length: 255 }).notNull(),
  name_en: varchar('name_en', { length: 255 }).notNull(),
  name_de: varchar('name_de', { length: 255 }).notNull(),
  parent_id: integer('parent_id'),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
});

// Agents
export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  avatar: text('avatar'),
  bio_al: text('bio_al'),
  bio_en: text('bio_en'),
  bio_de: text('bio_de'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Properties
export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  title_al: varchar('title_al', { length: 500 }).notNull(),
  title_en: varchar('title_en', { length: 500 }).notNull(),
  title_de: varchar('title_de', { length: 500 }).notNull(),
  description_al: text('description_al').notNull(),
  description_en: text('description_en').notNull(),
  description_de: text('description_de').notNull(),
  type: propertyTypeEnum('type').notNull(),
  category: propertyCategoryEnum('category').notNull(),
  price: integer('price').notNull(),
  currency: varchar('currency', { length: 10 }).default('EUR').notNull(),
  surface_area: integer('surface_area').notNull(),
  rooms: integer('rooms'),
  bathrooms: integer('bathrooms'),
  floor: integer('floor'),
  year_built: integer('year_built'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  location_id: integer('location_id')
    .references(() => locations.id)
    .notNull(),
  agent_id: integer('agent_id')
    .references(() => agents.id)
    .notNull(),
  featured: boolean('featured').default(false).notNull(),
  status: propertyStatusEnum('status').default('active').notNull(),
  amenities: jsonb('amenities').default([]).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Property Images
export const propertyImages = pgTable('property_images', {
  id: serial('id').primaryKey(),
  property_id: integer('property_id')
    .references(() => properties.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  alt: varchar('alt', { length: 255 }),
  sort_order: integer('sort_order').default(0).notNull(),
  is_primary: boolean('is_primary').default(false).notNull(),
});

// Contacts (inquiries)
export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  property_id: integer('property_id').references(() => properties.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  message: text('message').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  is_read: boolean('is_read').default(false).notNull(),
});

// Property Requests (buyers / renters looking for property)
export const propertyRequests = pgTable('property_requests', {
  id: serial('id').primaryKey(),
  type: propertyRequestTypeEnum('type').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  min_price: integer('min_price'),
  max_price: integer('max_price'),
  location: varchar('location', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Admin Users
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('admin').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// ──────────────────────────────────────────────
// Relations
// ──────────────────────────────────────────────

export const locationsRelations = relations(locations, ({ one, many }) => ({
  parent: one(locations, {
    fields: [locations.parent_id],
    references: [locations.id],
    relationName: 'location_parent',
  }),
  children: many(locations, { relationName: 'location_parent' }),
  properties: many(properties),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  properties: many(properties),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  location: one(locations, {
    fields: [properties.location_id],
    references: [locations.id],
  }),
  agent: one(agents, {
    fields: [properties.agent_id],
    references: [agents.id],
  }),
  images: many(propertyImages),
  contacts: many(contacts),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.property_id],
    references: [properties.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  property: one(properties, {
    fields: [contacts.property_id],
    references: [properties.id],
  }),
}));

// ──────────────────────────────────────────────
// Inferred Types
// ──────────────────────────────────────────────

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type PropertyImage = typeof propertyImages.$inferSelect;
export type NewPropertyImage = typeof propertyImages.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export type PropertyRequest = typeof propertyRequests.$inferSelect;
export type NewPropertyRequest = typeof propertyRequests.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
