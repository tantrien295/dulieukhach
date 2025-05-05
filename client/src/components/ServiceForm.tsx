import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { serviceInsertSchema, Service } from "@shared/schema";
import ImageUpload from "./ImageUpload";

// Extend the schema for form validation
const serviceFormSchema = serviceInsertSchema.extend({
  serviceDate: z.string().min(1, "Service date is required"),
  images: z.array(z.string()).optional(),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
  customerId: number;
  service?: Service;
  isEditing?: boolean;
  onCancel: () => void;
}

export default function ServiceForm({ 
  customerId, 
  service, 
  isEditing = false, 
  onCancel 
}: ServiceFormProps) {
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Get staff members for dropdown
  const { data: staffMembers = [] } = useQuery<{ id: number, name: string, role: string }[]>({
    queryKey: ["/api/staff"],
  });

  const defaultValues = isEditing && service
    ? {
        ...service,
        serviceDate: new Date(service.serviceDate).toISOString().split('T')[0],
        images: []
      }
    : {
        customerId,
        serviceName: "",
        staffName: "",
        serviceDate: new Date().toISOString().split('T')[0],
        notes: "",
        images: []
      };

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    setValue
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues
  });

  const serviceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      // Prepare data for API
      // Let the schema handle date conversion
      const serviceData = {
        customerId: customerId,
        serviceName: data.serviceName,
        staffName: data.staffName || null,
        serviceDate: data.serviceDate,
        notes: data.notes || null
      };

      let serviceId;
      if (isEditing && service) {
        await apiRequest('PUT', `/api/services/${service.id}`, serviceData);
        serviceId = service.id;
      } else {
        const res = await apiRequest('POST', '/api/services', serviceData);
        const newService = await res.json();
        serviceId = newService.id;
      }

      // Upload images if any
      if (uploadedImages.length > 0) {
        for (const imageUrl of uploadedImages) {
          await apiRequest('POST', `/api/services/${serviceId}/images`, { imageUrl });
        }
      }

      return serviceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}/services`] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}`] });
      
      toast({
        title: isEditing ? "Service updated" : "Service added",
        description: isEditing 
          ? "Service record has been updated successfully." 
          : "New service has been added successfully.",
      });
      
      onCancel();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} service: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleImageUpload = (imageUrls: string[]) => {
    setUploadedImages(imageUrls);
    setValue('images', imageUrls);
  };

  const onSubmit = (data: ServiceFormData) => {
    serviceMutation.mutate(data);
  };

  return (
    <div className="card mt-6">
      <div className="card-header flex justify-between items-center">
        <h3 className="font-semibold">{isEditing ? "Edit Service" : "Add New Service"}</h3>
        <button 
          onClick={onCancel}
          className="text-neutral-dark hover:text-[#5C6BC0]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="card-content">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Service Type*</label>
              <select 
                className={`form-select ${errors.serviceName ? 'border-red-500' : ''}`}
                {...register("serviceName")}
              >
                <option value="">Select a service...</option>
                <option value="Haircut & Styling">Haircut & Styling</option>
                <option value="Hair Coloring">Hair Coloring</option>
                <option value="Highlights/Lowlights">Highlights/Lowlights</option>
                <option value="Hair Treatment">Hair Treatment</option>
                <option value="Facial">Facial</option>
                <option value="Massage">Massage</option>
                <option value="Manicure">Manicure</option>
                <option value="Pedicure">Pedicure</option>
                <option value="Manicure & Pedicure">Manicure & Pedicure</option>
                <option value="Waxing">Waxing</option>
                <option value="Other">Other</option>
              </select>
              {errors.serviceName && (
                <p className="text-red-500 text-xs mt-1">{errors.serviceName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Service Date*</label>
              <input 
                type="date" 
                className={`form-input ${errors.serviceDate ? 'border-red-500' : ''}`}
                {...register("serviceDate")}
              />
              {errors.serviceDate && (
                <p className="text-red-500 text-xs mt-1">{errors.serviceDate.message}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Staff</label>
            <select 
              className="form-select"
              {...register("staffName")}
            >
              <option value="">Select staff member...</option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={`${staff.name} (${staff.role})`}>
                  {staff.name} ({staff.role})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea 
              rows={4} 
              className="form-textarea"
              placeholder="Enter detailed notes about the service..."
              {...register("notes")}
            ></textarea>
          </div>

          <ImageUpload onImagesUploaded={handleImageUpload} />

          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              className="btn-outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update Service" : "Save Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
