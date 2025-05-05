import { db } from "@db";
import { eq, desc, count, sql, and } from "drizzle-orm";
import { 
  customers, 
  services, 
  serviceImages, 
  staffMembers,
  CustomerInsert,
  ServiceInsert
} from "@shared/schema";

// Function to get all customers with summary info
export async function getCustomersWithSummary() {
  // First get all customers
  const allCustomers = await db.query.customers.findMany({
    orderBy: desc(customers.createdAt)
  });

  // For each customer, get their visit count and last service
  const customersWithSummary = await Promise.all(allCustomers.map(async (customer) => {
    // Get services count for this customer
    const visitCountResult = await db
      .select({ count: count() })
      .from(services)
      .where(eq(services.customerId, customer.id));
    
    const visitCount = visitCountResult[0]?.count || 0;

    // Get the last service for this customer
    const lastServiceResult = await db.query.services.findMany({
      where: eq(services.customerId, customer.id),
      orderBy: desc(services.serviceDate),
      limit: 1
    });

    const lastService = lastServiceResult[0] || null;
    const lastVisit = lastService?.serviceDate || null;

    return {
      ...customer,
      visitCount,
      lastService,
      lastVisit
    };
  }));

  return customersWithSummary;
}

// Function to get a customer by ID with visit count
export async function getCustomerById(id: number) {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id)
  });

  if (!customer) return null;

  // Get visit count
  const visitCountResult = await db
    .select({ count: count() })
    .from(services)
    .where(eq(services.customerId, id));
  
  const visitCount = visitCountResult[0]?.count || 0;

  return {
    ...customer,
    visitCount
  };
}

// Function to get customer summary
export async function getCustomerSummary(id: number) {
  // Get first visit date
  const firstVisitResult = await db.query.services.findMany({
    where: eq(services.customerId, id),
    orderBy: services.serviceDate,
    limit: 1
  });

  // Get last visit date
  const lastVisitResult = await db.query.services.findMany({
    where: eq(services.customerId, id),
    orderBy: desc(services.serviceDate),
    limit: 1
  });

  // Get favorite service (most frequent)
  const favoriteServiceResult = await db
    .select({
      serviceName: services.serviceName,
      count: count()
    })
    .from(services)
    .where(eq(services.customerId, id))
    .groupBy(services.serviceName)
    .orderBy(desc(sql`count`))
    .limit(1);

  return {
    firstVisit: firstVisitResult[0]?.serviceDate || null,
    lastVisit: lastVisitResult[0]?.serviceDate || null,
    favoriteService: favoriteServiceResult[0]?.serviceName || null
  };
}

// Function to create a new customer
export async function createCustomer(customerData: CustomerInsert) {
  const [newCustomer] = await db.insert(customers).values(customerData).returning();
  return newCustomer;
}

// Function to update a customer
export async function updateCustomer(id: number, customerData: CustomerInsert) {
  const [updatedCustomer] = await db
    .update(customers)
    .set(customerData)
    .where(eq(customers.id, id))
    .returning();
  
  return updatedCustomer || null;
}

// Function to delete a customer
export async function deleteCustomer(id: number) {
  // First, delete all related service images
  const customerServices = await db.query.services.findMany({
    where: eq(services.customerId, id)
  });

  for (const service of customerServices) {
    await db.delete(serviceImages).where(eq(serviceImages.serviceId, service.id));
  }

  // Then delete all services
  await db.delete(services).where(eq(services.customerId, id));

  // Finally delete the customer
  const [deletedCustomer] = await db
    .delete(customers)
    .where(eq(customers.id, id))
    .returning();
  
  return !!deletedCustomer;
}

// Function to get services by customer ID
export async function getServicesByCustomerId(customerId: number) {
  const customerServices = await db.query.services.findMany({
    where: eq(services.customerId, customerId),
    orderBy: desc(services.serviceDate)
  });

  return customerServices;
}

// Function to create a new service
export async function createService(serviceData: ServiceInsert) {
  const [newService] = await db.insert(services).values(serviceData).returning();
  return newService;
}

// Function to update a service
export async function updateService(id: number, serviceData: ServiceInsert) {
  const [updatedService] = await db
    .update(services)
    .set(serviceData)
    .where(eq(services.id, id))
    .returning();
  
  return updatedService || null;
}

// Function to delete a service
export async function deleteService(id: number) {
  // First delete related images
  await db.delete(serviceImages).where(eq(serviceImages.serviceId, id));

  // Then delete the service
  const [deletedService] = await db
    .delete(services)
    .where(eq(services.id, id))
    .returning();
  
  return !!deletedService;
}

// Function to get service images
export async function getServiceImages(serviceId: number) {
  const images = await db.query.serviceImages.findMany({
    where: eq(serviceImages.serviceId, serviceId)
  });

  return images;
}

// Function to add a service image
export async function addServiceImage(serviceId: number, imageUrl: string) {
  const [newImage] = await db
    .insert(serviceImages)
    .values({ serviceId, imageUrl })
    .returning();
  
  return newImage;
}

// Function to delete a service image
export async function deleteServiceImage(id: number) {
  const [deletedImage] = await db
    .delete(serviceImages)
    .where(eq(serviceImages.id, id))
    .returning();
  
  return !!deletedImage;
}

// Function to get all staff members
export async function getStaffMembers() {
  const allStaff = await db.query.staffMembers.findMany({
    orderBy: staffMembers.name
  });

  return allStaff;
}

export const storage = {
  getCustomersWithSummary,
  getCustomerById,
  getCustomerSummary,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getServicesByCustomerId,
  createService,
  updateService,
  deleteService,
  getServiceImages,
  addServiceImage,
  deleteServiceImage,
  getStaffMembers
};
