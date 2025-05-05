import { pgTable, text, serial, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  birthdate: date("birthdate"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  serviceName: text("service_name").notNull(),
  notes: text("notes"),
  staffName: text("staff_name"),
  serviceDate: timestamp("service_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Service Images table
export const serviceImages = pgTable("service_images", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Staff members table
export const staffMembers = pgTable("staff_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Define relations
export const customersRelations = relations(customers, ({ many }) => ({
  services: many(services)
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  customer: one(customers, { fields: [services.customerId], references: [customers.id] }),
  images: many(serviceImages)
}));

export const serviceImagesRelations = relations(serviceImages, ({ one }) => ({
  service: one(services, { fields: [serviceImages.serviceId], references: [services.id] })
}));

// Zod schemas for validation
export const customerInsertSchema = createInsertSchema(customers, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  phone: (schema) => schema.min(7, "Phone number must be at least 7 characters"),
  birthdate: (schema) => schema
    .nullable()
    .or(z.date())
    .or(z.string().transform(val => val ? new Date(val) : null)),
  address: (schema) => schema.optional(),
  notes: (schema) => schema.optional()
});

export const serviceInsertSchema = createInsertSchema(services, {
  serviceName: (schema) => schema.min(2, "Service name must be at least 2 characters"),
  notes: (schema) => schema.optional(),
  staffName: (schema) => schema.optional(),
  serviceDate: (schema) => schema
    .or(z.date())
    .or(z.string().transform(val => val ? new Date(val) : new Date()))
});

export const serviceImageInsertSchema = createInsertSchema(serviceImages);
export const staffMemberInsertSchema = createInsertSchema(staffMembers);

// Select schemas
export const customerSelectSchema = createSelectSchema(customers);
export const serviceSelectSchema = createSelectSchema(services);
export const serviceImageSelectSchema = createSelectSchema(serviceImages);
export const staffMemberSelectSchema = createSelectSchema(staffMembers);

// Types
export type Customer = typeof customers.$inferSelect;
export type CustomerInsert = z.infer<typeof customerInsertSchema>;

export type Service = typeof services.$inferSelect;
export type ServiceInsert = z.infer<typeof serviceInsertSchema>;

export type ServiceImage = typeof serviceImages.$inferSelect;
export type ServiceImageInsert = z.infer<typeof serviceImageInsertSchema>;

export type StaffMember = typeof staffMembers.$inferSelect;
export type StaffMemberInsert = z.infer<typeof staffMemberInsertSchema>;

// Types with relations
export type CustomerWithServices = Customer & {
  services: Service[];
};

export type ServiceWithImages = Service & {
  images: ServiceImage[];
};
