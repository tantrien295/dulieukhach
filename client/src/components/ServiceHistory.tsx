import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Edit, Trash, Scissors, Calendar, CircleDollarSign, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Service, ServiceImage } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ServiceForm from "@/components/ServiceForm";

interface ServiceHistoryProps {
  customerId: number;
  onAddServiceClick: () => void;
}

export default function ServiceHistory({ customerId, onAddServiceClick }: ServiceHistoryProps) {
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch services for the customer
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: [`/api/customers/${customerId}/services`],
  });

  // Mutation for deleting a service
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      return apiRequest(`/api/services/${serviceId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}/services`] });
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}`] });
      toast({
        title: "Xóa thành công",
        description: "Dịch vụ đã được xóa thành công.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa dịch vụ.",
        variant: "destructive",
      });
    },
  });

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsServiceFormOpen(true);
  };

  const handleDeleteService = (serviceId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?")) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  const handleCancelEdit = () => {
    setSelectedService(null);
    setIsServiceFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lịch Sử Dịch Vụ</CardTitle>
        <Button size="sm" onClick={onAddServiceClick}>
          <Plus className="h-4 w-4 mr-2" /> Thêm Dịch Vụ
        </Button>
      </CardHeader>
      <CardContent>
        {!services || services.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Scissors className="h-8 w-8 mx-auto mb-2" />
            <p>Chưa có dịch vụ nào được ghi nhận</p>
            <Button variant="outline" className="mt-2" onClick={onAddServiceClick}>
              Thêm Dịch Vụ Đầu Tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4 relative">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{service.serviceName}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(service.serviceDate)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      <CircleDollarSign className="h-3 w-3 mr-1" /> 
                      {service.price}
                    </Badge>
                    
                    <div className="flex mt-1 space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditService(service)}
                        className="h-7 w-7"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteService(service.id)}
                        className="h-7 w-7 text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {service.notes && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-sm">{service.notes}</p>
                  </>
                )}
                
                <ServiceImages serviceId={service.id} />
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Service Dialog */}
      <Dialog open={isServiceFormOpen} onOpenChange={setIsServiceFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sửa Dịch Vụ</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <ServiceForm 
              customerId={customerId} 
              service={selectedService} 
              isEditing={true}
              onCancel={handleCancelEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

interface ServiceImagesProps {
  serviceId: number;
}

function ServiceImages({ serviceId }: ServiceImagesProps) {
  // Fetch images for the service
  const { data: images, isLoading } = useQuery<ServiceImage[]>({
    queryKey: [`/api/services/${serviceId}/images`],
  });

  if (isLoading || !images || images.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center text-sm font-medium mb-2">
        <ImageIcon className="h-4 w-4 mr-1" /> Hình Ảnh
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {images.map((image) => (
          <div key={image.id} className="h-20 w-full rounded-md overflow-hidden">
            <img
              src={image.imageUrl}
              alt="Service"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}