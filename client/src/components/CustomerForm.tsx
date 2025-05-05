import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { customerInsertSchema, Customer, CustomerInsert } from "@shared/schema";

// Extend the schema for form validation
const customerFormSchema = customerInsertSchema.extend({
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  customer?: Customer;
  isEditing?: boolean;
}

export default function CustomerForm({ customer, isEditing = false }: CustomerFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Split address into components if editing
  const getAddressComponents = () => {
    if (!customer?.address) return {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: ""
    };
    
    // This is a simplified parsing - in a real app, we'd want more robust parsing
    const addressParts = customer.address.split(',');
    let addressLine1 = "", addressLine2 = "", city = "", state = "", zipCode = "";
    
    if (addressParts.length >= 1) addressLine1 = addressParts[0].trim();
    if (addressParts.length >= 2) {
      const cityStateZip = addressParts[1].trim().split(' ');
      if (cityStateZip.length >= 1) city = cityStateZip[0];
      if (cityStateZip.length >= 2) state = cityStateZip[1];
      if (cityStateZip.length >= 3) zipCode = cityStateZip[2];
    }
    
    return { addressLine1, addressLine2, city, state, zipCode };
  };

  // Parse existing data if editing
  const defaultValues = isEditing && customer
    ? {
        ...customer,
        ...getAddressComponents()
      }
    : {
        name: "",
        phone: "",
        birthdate: "",
        notes: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: ""
      };

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues
  });

  const customerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      // Combine address fields
      const addressParts = [];
      if (data.addressLine1) addressParts.push(data.addressLine1);
      if (data.addressLine2) addressParts.push(data.addressLine2);
      
      let cityStateZip = "";
      if (data.city) cityStateZip += data.city;
      if (data.state) cityStateZip += data.city ? `, ${data.state}` : data.state;
      if (data.zipCode) cityStateZip += cityStateZip ? ` ${data.zipCode}` : data.zipCode;
      
      if (cityStateZip) addressParts.push(cityStateZip);
      
      // Prepare data for API
      // Let the schema handle date conversion
      const customerData: CustomerInsert = {
        name: data.name,
        phone: data.phone,
        birthdate: data.birthdate || null,
        address: addressParts.join(', ') || null,
        notes: data.notes || null
      };

      if (isEditing && customer) {
        await apiRequest('PUT', `/api/customers/${customer.id}`, customerData);
        return customer.id;
      } else {
        const res = await apiRequest('POST', '/api/customers', customerData);
        const newCustomer = await res.json();
        return newCustomer.id;
      }
    },
    onSuccess: (customerId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      if (customerId) {
        queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}`] });
      }
      
      toast({
        title: isEditing ? "Customer updated" : "Customer added",
        description: isEditing 
          ? "Customer information has been updated successfully." 
          : "New customer has been added successfully.",
      });
      
      navigate(customerId ? `/customers/${customerId}` : '/');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} customer: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CustomerFormData) => {
    customerMutation.mutate(data);
  };

  return (
    <>
      <header className="bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 rounded-md hover:bg-[#F5F7FA]"
              onClick={() => navigate(customer ? `/customers/${customer.id}` : '/')}
            >
              <ChevronLeft className="h-5 w-5 text-neutral-dark" />
            </button>
            <h2 className="text-xl font-semibold">
              {isEditing ? "Sửa Thông Tin Khách Hàng" : "Thêm Khách Hàng Mới"}
            </h2>
          </div>
        </div>
      </header>

      <div className="p-6 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Thông Tin Khách Hàng</h3>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Họ Tên*</label>
                    <input 
                      type="text" 
                      className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Nhập họ tên đầy đủ" 
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number*</label>
                    <input 
                      type="tel" 
                      className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="(555) 123-4567" 
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Birth Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    {...register("birthdate")}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input 
                    type="text" 
                    className="form-input mb-2"
                    placeholder="Street Address" 
                    {...register("addressLine1")}
                  />
                  <input 
                    type="text" 
                    className="form-input mb-2"
                    placeholder="Apt, Suite, etc. (optional)" 
                    {...register("addressLine2")}
                  />
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="City" 
                      {...register("city")}
                    />
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="State" 
                      {...register("state")}
                    />
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="ZIP Code" 
                      {...register("zipCode")}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Additional Notes</label>
                  <textarea 
                    rows={3} 
                    className="form-textarea"
                    placeholder="Enter any special notes, preferences, or health concerns..." 
                    {...register("notes")}
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button" 
                    className="btn-outline"
                    onClick={() => navigate(customer ? `/customers/${customer.id}` : '/')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : isEditing ? "Update Customer" : "Save Customer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
