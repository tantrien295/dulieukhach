import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  customerInsertSchema, 
  serviceInsertSchema,
  staffMemberInsertSchema,
  serviceCategoryInsertSchema,
  serviceTypeInsertSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // All routes prefixed with /api
  
  // Customers routes
  app.get('/api/customers', async (req, res) => {
    try {
      const customers = await storage.getCustomersWithSummary();
      return res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }

      const customer = await storage.getCustomerById(id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      return res.json(customer);
    } catch (error) {
      console.error('Error fetching customer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/customers', async (req, res) => {
    try {
      const validatedData = customerInsertSchema.parse(req.body);
      const newCustomer = await storage.createCustomer(validatedData);
      return res.status(201).json(newCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating customer:', error);
      // Kiểm tra lỗi kết nối
      if (error instanceof Error && 
          (error.message.includes('ECONNREFUSED') || 
           error.message.includes('connection') ||
           error.message.includes('timeout'))) {
        return res.status(503).json({ 
          error: 'Không thể kết nối với cơ sở dữ liệu, vui lòng thử lại sau' 
        });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }

      const validatedData = customerInsertSchema.parse(req.body);
      const updatedCustomer = await storage.updateCustomer(id, validatedData);
      
      if (!updatedCustomer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      return res.json(updatedCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating customer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }

      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting customer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Customer summary
  app.get('/api/customers/:id/summary', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }

      const summary = await storage.getCustomerSummary(id);
      return res.json(summary);
    } catch (error) {
      console.error('Error fetching customer summary:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Services routes
  app.get('/api/customers/:id/services', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      if (isNaN(customerId)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }

      const services = await storage.getServicesByCustomerId(customerId);
      return res.json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get all services across all customers (for reports)
  app.get('/api/services', async (req, res) => {
    try {
      const services = await storage.getAllServices();
      return res.json(services);
    } catch (error) {
      console.error('Error fetching all services:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/services', async (req, res) => {
    try {
      const validatedData = serviceInsertSchema.parse(req.body);
      const newService = await storage.createService(validatedData);
      return res.status(201).json(newService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating service:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/services/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid service ID' });
      }

      const validatedData = serviceInsertSchema.parse(req.body);
      const updatedService = await storage.updateService(id, validatedData);
      
      if (!updatedService) {
        return res.status(404).json({ error: 'Service not found' });
      }

      return res.json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating service:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/services/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid service ID' });
      }

      const deleted = await storage.deleteService(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Service not found' });
      }

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting service:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Service images routes
  app.get('/api/services/:id/images', async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      if (isNaN(serviceId)) {
        return res.status(400).json({ error: 'Invalid service ID' });
      }

      const images = await storage.getServiceImages(serviceId);
      return res.json(images);
    } catch (error) {
      console.error('Error fetching service images:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/services/:id/images', async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      if (isNaN(serviceId)) {
        return res.status(400).json({ error: 'Invalid service ID' });
      }

      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }

      const newImage = await storage.addServiceImage(serviceId, imageUrl);
      return res.status(201).json(newImage);
    } catch (error) {
      console.error('Error adding service image:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/services/images/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid image ID' });
      }

      const deleted = await storage.deleteServiceImage(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Image not found' });
      }

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting service image:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Staff routes
  app.get('/api/staff', async (req, res) => {
    try {
      const staff = await storage.getStaffMembers();
      return res.json(staff);
    } catch (error) {
      console.error('Error fetching staff members:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/staff/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid staff ID' });
      }

      const staffMember = await storage.getStaffMemberById(id);
      if (!staffMember) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      return res.json(staffMember);
    } catch (error) {
      console.error('Error fetching staff member:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/staff', async (req, res) => {
    try {
      const validatedData = staffMemberInsertSchema.parse(req.body);
      const newStaff = await storage.createStaffMember(validatedData);
      return res.status(201).json(newStaff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating staff member:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/staff/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid staff ID' });
      }

      const validatedData = staffMemberInsertSchema.parse(req.body);
      const updatedStaff = await storage.updateStaffMember(id, validatedData);
      
      if (!updatedStaff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      return res.json(updatedStaff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating staff member:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/staff/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid staff ID' });
      }

      const deleted = await storage.deleteStaffMember(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting staff member:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Service categories routes
  app.get('/api/service-categories', async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      return res.json(categories);
    } catch (error) {
      console.error('Error fetching service categories:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/service-categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      const category = await storage.getServiceCategoryById(id);
      if (!category) {
        return res.status(404).json({ error: 'Service category not found' });
      }

      return res.json(category);
    } catch (error) {
      console.error('Error fetching service category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/service-categories', async (req, res) => {
    try {
      const validatedData = serviceCategoryInsertSchema.parse(req.body);
      const newCategory = await storage.createServiceCategory(validatedData);
      return res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating service category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/service-categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      const validatedData = serviceCategoryInsertSchema.parse(req.body);
      const updatedCategory = await storage.updateServiceCategory(id, validatedData);
      
      if (!updatedCategory) {
        return res.status(404).json({ error: 'Service category not found' });
      }

      return res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating service category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/service-categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      try {
        const deleted = await storage.deleteServiceCategory(id);
        if (!deleted) {
          return res.status(404).json({ error: 'Service category not found' });
        }
        return res.status(204).end();
      } catch (deleteError) {
        return res.status(400).json({ error: deleteError.message });
      }
    } catch (error) {
      console.error('Error deleting service category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Service types routes
  app.get('/api/service-types', async (req, res) => {
    try {
      const types = await storage.getServiceTypes();
      return res.json(types);
    } catch (error) {
      console.error('Error fetching service types:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/service-types/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid service type ID' });
      }

      const serviceType = await storage.getServiceTypeById(id);
      if (!serviceType) {
        return res.status(404).json({ error: 'Service type not found' });
      }

      return res.json(serviceType);
    } catch (error) {
      console.error('Error fetching service type:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/service-types', async (req, res) => {
    try {
      const validatedData = serviceTypeInsertSchema.parse(req.body);
      const newType = await storage.createServiceType(validatedData);
      return res.status(201).json(newType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating service type:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/service-types/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid service type ID' });
      }

      const validatedData = serviceTypeInsertSchema.parse(req.body);
      const updatedType = await storage.updateServiceType(id, validatedData);
      
      if (!updatedType) {
        return res.status(404).json({ error: 'Service type not found' });
      }

      return res.json(updatedType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating service type:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/service-types/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid service type ID' });
      }

      try {
        const deleted = await storage.deleteServiceType(id);
        if (!deleted) {
          return res.status(404).json({ error: 'Service type not found' });
        }
        return res.status(204).end();
      } catch (deleteError) {
        return res.status(400).json({ error: deleteError.message });
      }
    } catch (error) {
      console.error('Error deleting service type:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Staff service assignments routes
  app.post('/api/staff/:staffId/services/:serviceTypeId', async (req, res) => {
    try {
      const staffId = parseInt(req.params.staffId);
      const serviceTypeId = parseInt(req.params.serviceTypeId);
      
      if (isNaN(staffId) || isNaN(serviceTypeId)) {
        return res.status(400).json({ error: 'Invalid staff ID or service type ID' });
      }

      const assignment = await storage.assignServiceToStaff(staffId, serviceTypeId);
      return res.status(201).json(assignment);
    } catch (error) {
      console.error('Error assigning service to staff:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/staff/assignments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid assignment ID' });
      }

      const deleted = await storage.removeServiceFromStaff(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      return res.status(204).end();
    } catch (error) {
      console.error('Error removing service assignment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
