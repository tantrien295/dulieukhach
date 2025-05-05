import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Calendar, MapPin } from "lucide-react";
import { formatDate, formatPhone } from "@/lib/utils";
import { Customer, Service } from "@shared/schema";

interface CustomerListProps {
  searchTerm: string;
}

export default function CustomerList({ searchTerm }: CustomerListProps) {
  const [, navigate] = useLocation();
  
  const { data: customers, isLoading } = useQuery<(Customer & { lastService?: Service, lastVisit?: string, visitCount: number })[]>({
    queryKey: ["/api/customers"],
  });

  const filteredCustomers = customers?.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCustomerClick = (customerId: number) => {
    navigate(`/customers/${customerId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="customer-card p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-light">
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredCustomers.length === 0) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-neutral-medium text-xl mb-2">Không tìm thấy khách hàng</div>
          {searchTerm ? (
            <p>Không có kết quả phù hợp với tìm kiếm của bạn. Hãy thử từ khóa khác.</p>
          ) : (
            <p>Bạn chưa thêm khách hàng nào. Nhấn "Thêm Khách Hàng" để bắt đầu.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <div 
            key={customer.id} 
            className="customer-card" 
            onClick={() => handleCustomerClick(customer.id)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{customer.name}</h3>
                  <p className="text-neutral-dark text-sm mt-0.5">{formatPhone(customer.phone)}</p>
                </div>
                <div className="badge">
                  {customer.visitCount} lượt
                </div>
              </div>
              <div className="mt-3 text-sm text-neutral-dark">
                {customer.birthdate && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-neutral-medium" />
                    <span>{formatDate(customer.birthdate)}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-2 text-neutral-medium" />
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-light">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-dark">Lần ghé gần nhất:</span>
                  <span className="font-medium">{customer.lastVisit ? formatDate(customer.lastVisit) : 'Chưa từng'}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-neutral-dark">Dịch vụ gần nhất:</span>
                  <span className="font-medium">{customer.lastService?.serviceName || 'Không có'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
