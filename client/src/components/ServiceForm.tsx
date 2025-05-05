import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Service, ServiceInsert } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";

const serviceFormSchema = z.object({
  serviceName: z.string().min(2, "Service name must be at least 2 characters"),
  price: z.string().min(1, "Price is required"),
  notes: z.string().optional(),
  serviceDate: z.date({ required_error: "Service date is required" }),
  serviceTypeId: z.string().optional(),
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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      serviceName: service?.serviceName || "",
      price: service?.price || "",
      notes: service?.notes || "",
      serviceDate: service?.serviceDate ? new Date(service.serviceDate) : new Date(),
      serviceTypeId: service?.serviceTypeId?.toString() || undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      // Convert data for API
      const serviceData: ServiceInsert = {
        customerId,
        serviceName: data.serviceName,
        price: data.price,
        notes: data.notes || null,
        serviceDate: data.serviceDate.toISOString(),
        serviceTypeId: data.serviceTypeId ? parseInt(data.serviceTypeId) : null,
      };

      if (isEditing && service) {
        // Update existing service
        return apiRequest(`/api/services/${service.id}`, "PUT", serviceData);
      } else {
        // Create new service
        return apiRequest("/api/services", "POST", serviceData);
      }
    },
    onSuccess: async (data) => {
      // Handle image uploads if there are any
      if (uploadedImages.length > 0) {
        const serviceId = isEditing ? service!.id : data.id;
        
        // Add each image to the service
        for (const imageUrl of uploadedImages) {
          await apiRequest(`/api/services/${serviceId}/images`, "POST", { imageUrl });
        }
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}/services`] });
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}`] });
      
      // Show success message
      toast({
        title: isEditing ? "Service updated" : "Service added",
        description: isEditing 
          ? "The service has been updated successfully." 
          : "The service has been added successfully.",
      });

      // Reset form and close
      form.reset();
      onCancel();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the service.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    mutation.mutate(data);
  };

  const onImagesUploaded = (imageUrls: string[]) => {
    setUploadedImages(imageUrls);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="serviceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên Dịch Vụ</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giá Tiền</FormLabel>
              <FormControl>
                <Input {...field} placeholder="0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Ngày Thực Hiện</FormLabel>
              <DatePicker
                date={field.value}
                onSelect={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại Dịch Vụ</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại dịch vụ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Cắt Tóc</SelectItem>
                  <SelectItem value="2">Nhuộm Màu</SelectItem>
                  <SelectItem value="3">Tạo Kiểu</SelectItem>
                  <SelectItem value="4">Chăm Sóc</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi Chú</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Thông tin chi tiết về dịch vụ..." 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Hình Ảnh Dịch Vụ</FormLabel>
          <ImageUpload onImagesUploaded={onImagesUploaded} />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Hủy
          </Button>
          <Button 
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Đang Lưu..." : isEditing ? "Cập Nhật Dịch Vụ" : "Thêm Dịch Vụ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}