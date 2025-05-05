import { db } from "@db";
import { eq, desc, count, sql, and, isNull, isNotNull } from "drizzle-orm";
import { 
  customers, 
  services, 
  serviceImages, 
  staffMembers,
  serviceCategories,
  serviceTypes,
  staffServiceAssignments,
  CustomerInsert,
  ServiceInsert,
  ServiceCategoryInsert,
  ServiceTypeInsert,
  StaffMemberInsert,
  StaffServiceAssignmentInsert
} from "@shared/schema";

// Function to get all customers with summary info
export async function getCustomersWithSummary() {
  try {
    console.log("Attempting to fetch all customers from database...");
    // First get all customers
    const allCustomers = await db.query.customers.findMany({
      orderBy: desc(customers.createdAt)
    });
    console.log(`Successfully fetched ${allCustomers.length} customers from database`);

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
  } catch (error) {
    console.error("Error in getCustomersWithSummary:", error);
    throw error; // Re-throw to be handled by the route handler
  }
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
  try {
    // Đảm bảo dữ liệu ngày tháng được xử lý đúng
    const sanitizedData = {
      ...customerData,
      // Chuyển đổi Date thành string nếu cần
      birthdate: customerData.birthdate instanceof Date 
        ? customerData.birthdate.toISOString() 
        : customerData.birthdate
    };
    
    const [newCustomer] = await db.insert(customers).values(sanitizedData).returning();
    return newCustomer;
  } catch (error) {
    console.error("Error in createCustomer:", error);
    throw error;
  }
}

// Function to update a customer
export async function updateCustomer(id: number, customerData: CustomerInsert) {
  try {
    // Đảm bảo dữ liệu ngày tháng được xử lý đúng
    const sanitizedData = {
      ...customerData,
      // Chuyển đổi Date thành string nếu cần
      birthdate: customerData.birthdate instanceof Date 
        ? customerData.birthdate.toISOString() 
        : customerData.birthdate
    };
    
    const [updatedCustomer] = await db
      .update(customers)
      .set(sanitizedData)
      .where(eq(customers.id, id))
      .returning();
    
    return updatedCustomer || null;
  } catch (error) {
    console.error("Error in updateCustomer:", error);
    throw error;
  }
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
    orderBy: staffMembers.name,
    with: {
      serviceAssignments: {
        with: {
          serviceType: {
            with: {
              category: true
            }
          }
        }
      }
    }
  });

  return allStaff;
}

// Function to get a staff member by ID
export async function getStaffMemberById(id: number) {
  const staffMember = await db.query.staffMembers.findFirst({
    where: eq(staffMembers.id, id),
    with: {
      serviceAssignments: {
        with: {
          serviceType: {
            with: {
              category: true
            }
          }
        }
      }
    }
  });

  return staffMember;
}

// Function to create a staff member
export async function createStaffMember(staffData: StaffMemberInsert) {
  const [newStaff] = await db.insert(staffMembers).values(staffData).returning();
  return newStaff;
}

// Function to update a staff member
export async function updateStaffMember(id: number, staffData: StaffMemberInsert) {
  const [updatedStaff] = await db
    .update(staffMembers)
    .set(staffData)
    .where(eq(staffMembers.id, id))
    .returning();
  
  return updatedStaff || null;
}

// Function to delete a staff member
export async function deleteStaffMember(id: number) {
  // First delete all service assignments
  await db.delete(staffServiceAssignments).where(eq(staffServiceAssignments.staffId, id));
  
  // Then delete the staff member
  const [deletedStaff] = await db
    .delete(staffMembers)
    .where(eq(staffMembers.id, id))
    .returning();
  
  return !!deletedStaff;
}

// Function to get all service categories
export async function getServiceCategories() {
  const categories = await db.query.serviceCategories.findMany({
    orderBy: serviceCategories.name,
    with: {
      serviceTypes: true
    }
  });

  return categories;
}

// Function to get a service category by ID
export async function getServiceCategoryById(id: number) {
  const category = await db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, id),
    with: {
      serviceTypes: true
    }
  });

  return category;
}

// Function to create a service category
export async function createServiceCategory(categoryData: ServiceCategoryInsert) {
  const [newCategory] = await db.insert(serviceCategories).values(categoryData).returning();
  return newCategory;
}

// Function to update a service category
export async function updateServiceCategory(id: number, categoryData: ServiceCategoryInsert) {
  const [updatedCategory] = await db
    .update(serviceCategories)
    .set(categoryData)
    .where(eq(serviceCategories.id, id))
    .returning();
  
  return updatedCategory || null;
}

// Function to delete a service category
export async function deleteServiceCategory(id: number) {
  // Check if there are service types using this category
  const serviceTypeCount = await db
    .select({ count: count() })
    .from(serviceTypes)
    .where(eq(serviceTypes.categoryId, id));
  
  if (serviceTypeCount[0]?.count > 0) {
    throw new Error("Cannot delete category that has service types");
  }
  
  const [deletedCategory] = await db
    .delete(serviceCategories)
    .where(eq(serviceCategories.id, id))
    .returning();
  
  return !!deletedCategory;
}

// Function to get all service types
export async function getServiceTypes() {
  const types = await db.query.serviceTypes.findMany({
    orderBy: serviceTypes.name,
    with: {
      category: true
    }
  });

  return types;
}

// Function to get a service type by ID
export async function getServiceTypeById(id: number) {
  const type = await db.query.serviceTypes.findFirst({
    where: eq(serviceTypes.id, id),
    with: {
      category: true
    }
  });

  return type;
}

// Function to create a service type
export async function createServiceType(typeData: ServiceTypeInsert) {
  const [newType] = await db.insert(serviceTypes).values(typeData).returning();
  return newType;
}

// Function to update a service type
export async function updateServiceType(id: number, typeData: ServiceTypeInsert) {
  const [updatedType] = await db
    .update(serviceTypes)
    .set(typeData)
    .where(eq(serviceTypes.id, id))
    .returning();
  
  return updatedType || null;
}

// Function to delete a service type
export async function deleteServiceType(id: number) {
  // Check if there are service assignments using this type
  const assignmentCount = await db
    .select({ count: count() })
    .from(staffServiceAssignments)
    .where(eq(staffServiceAssignments.serviceTypeId, id));
  
  if (assignmentCount[0]?.count > 0) {
    throw new Error("Cannot delete service type that has staff assignments");
  }
  
  const [deletedType] = await db
    .delete(serviceTypes)
    .where(eq(serviceTypes.id, id))
    .returning();
  
  return !!deletedType;
}

// Function to assign a service type to a staff member
export async function assignServiceToStaff(staffId: number, serviceTypeId: number) {
  // Check if assignment already exists
  const existingAssignment = await db.query.staffServiceAssignments.findFirst({
    where: and(
      eq(staffServiceAssignments.staffId, staffId),
      eq(staffServiceAssignments.serviceTypeId, serviceTypeId)
    )
  });

  if (existingAssignment) {
    return existingAssignment;
  }
  
  const [newAssignment] = await db
    .insert(staffServiceAssignments)
    .values({ staffId, serviceTypeId })
    .returning();
  
  return newAssignment;
}

// Function to remove a service assignment from a staff member
export async function removeServiceFromStaff(assignmentId: number) {
  const [deletedAssignment] = await db
    .delete(staffServiceAssignments)
    .where(eq(staffServiceAssignments.id, assignmentId))
    .returning();
  
  return !!deletedAssignment;
}

// Function to get all services for reports
export async function getAllServices() {
  const allServices = await db.query.services.findMany({
    orderBy: desc(services.serviceDate)
  });

  return allServices;
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
  getAllServices,
  
  // Staff-related functions
  getStaffMembers,
  getStaffMemberById,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  
  // Service categories
  getServiceCategories,
  getServiceCategoryById,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  
  // Service types
  getServiceTypes,
  getServiceTypeById,
  createServiceType,
  updateServiceType,
  deleteServiceType,
  
  // Service assignments
  assignServiceToStaff,
  removeServiceFromStaff
};
