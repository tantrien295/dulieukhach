import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Filter, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@shared/schema";

interface ServiceHistoryProps {
  customerId: number;
  onAddServiceClick: () => void;
}

export default function ServiceHistory({ customerId, onAddServiceClick }: ServiceHistoryProps) {
  const { toast } = useToast();
  const [expandedServiceIds, setExpandedServiceIds] = useState<number[]>([]);
  
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: [`/api/customers/${customerId}/services`],
  });
  
  // Function to toggle service expansion
  const toggleServiceExpansion = (serviceId: number) => {
    setExpandedServiceIds(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  
  const isServiceExpanded = (serviceId: number) => {
    return expandedServiceIds.includes(serviceId);
  };
  
  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="card-header">
          <h3 className="font-semibold h-5 bg-gray-200 rounded w-1/3"></h3>
        </div>
        <div className="border-b border-neutral-light h-20 p-4"></div>
        <div className="border-b border-neutral-light h-20 p-4"></div>
        <div className="border-b border-neutral-light h-20 p-4"></div>
      </div>
    );
  }
  
  if (!services || services.length === 0) {
    return (
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="font-semibold">Service History</h3>
          <div className="flex items-center space-x-2">
            <button className="text-neutral-dark hover:text-[#5C6BC0] p-1" title="Filter">
              <Filter className="h-5 w-5" />
            </button>
            <button className="text-neutral-dark hover:text-[#5C6BC0] p-1" title="Export">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-neutral-dark mb-4">No service records found for this customer.</p>
          <button 
            className="btn-secondary inline-flex"
            onClick={onAddServiceClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add First Service
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="font-semibold">Service History</h3>
        <div className="flex items-center space-x-2">
          <button className="text-neutral-dark hover:text-[#5C6BC0] p-1" title="Filter">
            <Filter className="h-5 w-5" />
          </button>
          <button className="text-neutral-dark hover:text-[#5C6BC0] p-1" title="Export">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {services.map((service) => (
        <div key={service.id} className="border-b border-neutral-light">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{service.serviceName}</h4>
                <div className="flex items-center mt-1 text-sm text-neutral-dark">
                  <span className="mr-2">{formatDate(service.serviceDate)}</span>
                  {service.staffName && (
                    <span className="bg-[#F5F7FA] px-2 py-0.5 rounded">{service.staffName}</span>
                  )}
                </div>
              </div>
              <button 
                className="text-neutral-dark hover:text-[#5C6BC0]"
                onClick={() => toggleServiceExpansion(service.id)}
              >
                {isServiceExpanded(service.id) 
                  ? <ChevronUp className="h-5 w-5" /> 
                  : <ChevronDown className="h-5 w-5" />
                }
              </button>
            </div>
            
            {isServiceExpanded(service.id) && (
              <div className="mt-3">
                {service.notes && (
                  <div className="bg-[#F5F7FA] rounded-lg p-3 text-sm">
                    <p>{service.notes}</p>
                  </div>
                )}
                
                {/* Images would be loaded here */}
                <ServiceImages serviceId={service.id} />
              </div>
            )}
          </div>
        </div>
      ))}

      {services.length > 5 && (
        <div className="p-4 border-t border-neutral-light text-center">
          <button className="text-[#5C6BC0] hover:text-[#3F51B5] text-sm font-medium">
            Load More Services
          </button>
        </div>
      )}
    </div>
  );
}

interface ServiceImagesProps {
  serviceId: number;
}

function ServiceImages({ serviceId }: ServiceImagesProps) {
  const { data: images, isLoading } = useQuery({
    queryKey: [`/api/services/${serviceId}/images`],
  });
  
  if (isLoading) return <div className="mt-3 h-24 bg-gray-100 rounded animate-pulse"></div>;
  
  if (!images || images.length === 0) return null;
  
  return (
    <div className="mt-3 flex space-x-2">
      {images.map((image: { id: number, imageUrl: string }, index: number) => (
        <img 
          key={image.id}
          src={image.imageUrl} 
          alt={`Service image ${index + 1}`} 
          className="w-24 h-24 object-cover rounded-lg"
        />
      ))}
    </div>
  );
}
