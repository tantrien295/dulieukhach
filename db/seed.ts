import { db } from "./index";
import * as schema from "@shared/schema";
import { customerInsertSchema, serviceInsertSchema, staffMemberInsertSchema } from "@shared/schema";

async function seed() {
  try {
    // Seed staff members
    const staffData = [
      { name: "Jennifer", role: "Stylist" },
      { name: "Michael", role: "Stylist" },
      { name: "Ashley", role: "Colorist" },
      { name: "David", role: "Massage Therapist" },
      { name: "Maria", role: "Esthetician" }
    ];

    // Check if staff members exist
    const existingStaff = await db.query.staffMembers.findMany();
    if (existingStaff.length === 0) {
      for (const staff of staffData) {
        const validatedStaff = staffMemberInsertSchema.parse(staff);
        await db.insert(schema.staffMembers).values(validatedStaff);
      }
      console.log('Staff members seeded successfully');
    } else {
      console.log('Staff members already exist, skipping seed');
    }

    // Seed customers
    const customerData = [
      {
        name: "Sarah Johnson",
        phone: "(555) 123-4567",
        birthdate: new Date("1985-12-24"),
        address: "123 Main St, Anytown, CA",
        notes: "Prefers ammonia-free hair color. Allergic to lavender-based products."
      },
      {
        name: "Michael Chen",
        phone: "(555) 987-6543",
        birthdate: new Date("1990-05-17"),
        address: "456 Oak Ave, Baytown, NY",
        notes: "Sensitive scalp, use gentle products."
      },
      {
        name: "Emily Rodriguez",
        phone: "(555) 234-5678",
        birthdate: new Date("1982-09-03"),
        address: "789 Pine St, Westville, FL",
        notes: "Prefers female stylists only."
      },
      {
        name: "James Wilson",
        phone: "(555) 345-6789",
        birthdate: new Date("1977-11-29"),
        address: "321 Cedar Ln, Riverdale, TX",
        notes: "Always on time, prefers early appointments."
      },
      {
        name: "Sophia Martinez",
        phone: "(555) 456-7890",
        birthdate: new Date("1995-03-15"),
        address: "654 Maple Rd, Lakeside, WA",
        notes: "First-time client referred by James Wilson."
      }
    ];

    // Check if customers exist
    const existingCustomers = await db.query.customers.findMany();
    let seededCustomers = [];
    
    if (existingCustomers.length === 0) {
      for (const customer of customerData) {
        const validatedCustomer = customerInsertSchema.parse(customer);
        const [newCustomer] = await db.insert(schema.customers).values(validatedCustomer).returning();
        seededCustomers.push(newCustomer);
      }
      console.log('Customers seeded successfully');
    } else {
      console.log('Customers already exist, skipping seed');
      seededCustomers = existingCustomers;
    }

    // Seed services if customers were just created
    if (seededCustomers.length > 0 && existingCustomers.length === 0) {
      // Sample services for each customer
      const serviceData = [
        // Services for Sarah Johnson
        {
          customerId: seededCustomers[0].id,
          serviceName: "Hair Coloring",
          notes: "Used Wella Color Touch 7/0 with 10 vol developer. Client wanted to refresh her medium blonde color. Added a few highlights around the face for dimension. She was very happy with the results and scheduled her next appointment in 6 weeks.",
          staffName: "Jennifer (Stylist)",
          serviceDate: new Date("2023-06-15")
        },
        {
          customerId: seededCustomers[0].id,
          serviceName: "Haircut & Styling",
          notes: "Trim and layers, blow-dry with round brush for volume.",
          staffName: "Michael (Stylist)",
          serviceDate: new Date("2023-05-02")
        },
        {
          customerId: seededCustomers[0].id,
          serviceName: "Deep Conditioning Treatment",
          notes: "Used Kerastase nutrition mask for damaged hair.",
          staffName: "Jennifer (Stylist)",
          serviceDate: new Date("2023-03-18")
        },
        {
          customerId: seededCustomers[0].id,
          serviceName: "Haircut & Blowdry",
          notes: "Cut 2 inches, styled with beach waves.",
          staffName: "Michael (Stylist)",
          serviceDate: new Date("2023-02-05")
        },

        // Services for Michael Chen
        {
          customerId: seededCustomers[1].id,
          serviceName: "Facial Treatment",
          notes: "Deep cleansing facial with extraction and hydration mask.",
          staffName: "Maria (Esthetician)",
          serviceDate: new Date("2023-08-03")
        },
        {
          customerId: seededCustomers[1].id,
          serviceName: "Haircut",
          notes: "Modern fade with textured top.",
          staffName: "Michael (Stylist)",
          serviceDate: new Date("2023-06-20")
        },
        {
          customerId: seededCustomers[1].id,
          serviceName: "Scalp Treatment",
          notes: "Anti-dandruff treatment with tea tree oil.",
          staffName: "Jennifer (Stylist)",
          serviceDate: new Date("2023-04-11")
        },

        // Services for Emily Rodriguez
        {
          customerId: seededCustomers[2].id,
          serviceName: "Manicure & Pedicure",
          notes: "Gel polish on hands (shade: Berry Bliss), regular polish on toes (shade: Coral Sunset).",
          staffName: "Maria (Esthetician)",
          serviceDate: new Date("2023-09-22")
        },
        {
          customerId: seededCustomers[2].id,
          serviceName: "Hair Coloring",
          notes: "Full highlights with balayage technique.",
          staffName: "Ashley (Colorist)",
          serviceDate: new Date("2023-08-15")
        },
        {
          customerId: seededCustomers[2].id,
          serviceName: "Massage Therapy",
          notes: "60-minute deep tissue massage focusing on shoulders and back.",
          staffName: "David (Massage Therapist)",
          serviceDate: new Date("2023-07-02")
        },
        {
          customerId: seededCustomers[2].id,
          serviceName: "Facial",
          notes: "Anti-aging treatment with collagen mask.",
          staffName: "Maria (Esthetician)",
          serviceDate: new Date("2023-05-19")
        },

        // Services for James Wilson
        {
          customerId: seededCustomers[3].id,
          serviceName: "Haircut & Styling",
          notes: "Clean up sides and back, light trim on top. Styled with matte pomade.",
          staffName: "Michael (Stylist)",
          serviceDate: new Date("2023-07-18")
        },
        {
          customerId: seededCustomers[3].id,
          serviceName: "Massage",
          notes: "30-minute neck and shoulder focus.",
          staffName: "David (Massage Therapist)",
          serviceDate: new Date("2023-06-05")
        },
        {
          customerId: seededCustomers[3].id,
          serviceName: "Facial",
          notes: "Men's cleansing facial with exfoliation.",
          staffName: "Maria (Esthetician)",
          serviceDate: new Date("2023-04-22")
        },

        // Services for Sophia Martinez
        {
          customerId: seededCustomers[4].id,
          serviceName: "Massage Therapy",
          notes: "90-minute full body Swedish massage. First time client, enjoyed experience.",
          staffName: "David (Massage Therapist)",
          serviceDate: new Date("2023-09-05")
        },
        {
          customerId: seededCustomers[4].id,
          serviceName: "Manicure",
          notes: "Shape, buff, and clear polish with hand massage.",
          staffName: "Maria (Esthetician)",
          serviceDate: new Date("2023-08-19")
        }
      ];

      // Insert service records
      for (const service of serviceData) {
        const validatedService = serviceInsertSchema.parse(service);
        await db.insert(schema.services).values(validatedService);
      }

      // Add sample images for the first service (Hair Coloring for Sarah Johnson)
      // Using Unsplash images
      const sampleServiceImages = [
        "https://images.unsplash.com/photo-1562594980-47d4717c7c26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
        "https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
      ];

      // Get the first service ID (assuming it's the hair coloring service for Sarah)
      const firstService = await db.query.services.findFirst({
        where: and(
          eq(schema.services.customerId, seededCustomers[0].id),
          eq(schema.services.serviceName, "Hair Coloring")
        )
      });

      if (firstService) {
        for (const imageUrl of sampleServiceImages) {
          await db.insert(schema.serviceImages).values({
            serviceId: firstService.id,
            imageUrl
          });
        }
      }

      console.log('Services and images seeded successfully');
    } else {
      console.log('Skipping services seed');
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seed();
