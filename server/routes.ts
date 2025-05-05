import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { customerInsertSchema, serviceInsertSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
