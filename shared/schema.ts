import { pgTable, text, serial, integer, timestamp, date, decimal } from "drizzle-orm/pg-core";
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
  phone: text("phone"),
  email: text("email"),
  photoUrl: text("photo_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Service categories table
export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Service types table (predefined services with prices)
export const serviceTypes = pgTable("service_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  categoryId: integer("category_id").references(() => serviceCategories.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Staff service assignments (which staff can perform which services)
export const staffServiceAssignments = pgTable("staff_service_assignments", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").references(() => staffMembers.id).notNull(),
  serviceTypeId: integer("service_type_id").references(() => serviceTypes.id).notNull(),
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

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  serviceTypes: many(serviceTypes)
}));

export const serviceTypesRelations = relations(serviceTypes, ({ one, many }) => ({
  category: one(serviceCategories, { fields: [serviceTypes.categoryId], references: [serviceCategories.id] }),
  staffAssignments: many(staffServiceAssignments)
}));

export const staffMembersRelations = relations(staffMembers, ({ many }) => ({
  serviceAssignments: many(staffServiceAssignments)
}));

export const staffServiceAssignmentsRelations = relations(staffServiceAssignments, ({ one }) => ({
  staff: one(staffMembers, { fields: [staffServiceAssignments.staffId], references: [staffMembers.id] }),
  serviceType: one(serviceTypes, { fields: [staffServiceAssignments.serviceTypeId], references: [serviceTypes.id] })
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
export const staffMemberInsertSchema = createInsertSchema(staffMembers, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  role: (schema) => schema.min(2, "Role must be at least 2 characters"),
  phone: (schema) => schema.optional(),
  email: (schema) => schema.optional(),
  photoUrl: (schema) => schema.optional(),
  notes: (schema) => schema.optional()
});

export const serviceCategoryInsertSchema = createInsertSchema(serviceCategories, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  description: (schema) => schema.optional()
});

export const serviceTypeInsertSchema = createInsertSchema(serviceTypes, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  description: (schema) => schema.optional(),
  price: (schema) => schema,
  durationMinutes: (schema) => schema,
  categoryId: (schema) => schema.optional()
});

export const staffServiceAssignmentInsertSchema = createInsertSchema(staffServiceAssignments);

// Select schemas
export const customerSelectSchema = createSelectSchema(customers);
export const serviceSelectSchema = createSelectSchema(services);
export const serviceImageSelectSchema = createSelectSchema(serviceImages);
export const staffMemberSelectSchema = createSelectSchema(staffMembers);
export const serviceCategorySelectSchema = createSelectSchema(serviceCategories);
export const serviceTypeSelectSchema = createSelectSchema(serviceTypes);
export const staffServiceAssignmentSelectSchema = createSelectSchema(staffServiceAssignments);

// Types
export type Customer = typeof customers.$inferSelect;
export type CustomerInsert = z.infer<typeof customerInsertSchema>;

export type Service = typeof services.$inferSelect;
export type ServiceInsert = z.infer<typeof serviceInsertSchema>;

export type ServiceImage = typeof serviceImages.$inferSelect;
export type ServiceImageInsert = z.infer<typeof serviceImageInsertSchema>;

export type StaffMember = typeof staffMembers.$inferSelect;
export type StaffMemberInsert = z.infer<typeof staffMemberInsertSchema>;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type ServiceCategoryInsert = z.infer<typeof serviceCategoryInsertSchema>;

export type ServiceType = typeof serviceTypes.$inferSelect;
export type ServiceTypeInsert = z.infer<typeof serviceTypeInsertSchema>;

export type StaffServiceAssignment = typeof staffServiceAssignments.$inferSelect;
export type StaffServiceAssignmentInsert = z.infer<typeof staffServiceAssignmentInsertSchema>;

// Types with relations
export type CustomerWithServices = Customer & {
  services: Service[];
};

export type ServiceWithImages = Service & {
  images: ServiceImage[];
};

export type ServiceTypeWithCategory = ServiceType & {
  category: ServiceCategory;
};

export type StaffMemberWithServices = StaffMember & {
  serviceAssignments: (StaffServiceAssignment & {
    serviceType: ServiceType;
  })[];
};

export type ServiceCategoryWithTypes = ServiceCategory & {
  serviceTypes: ServiceType[];
};
