import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  Phone, 
  Mail, 
  MoreHorizontal, 
  Plus, 
  Calendar, 
  MapPin 
} from "lucide-react";
import { formatDate, formatPhone } from "@/lib/utils";
import ServiceHistory from "@/components/ServiceHistory";
import ServiceForm from "@/components/ServiceForm";
import { Customer, Service } from "@shared/schema";

export default function CustomerDetailPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/customers/:id");
  const customerId = params?.id ? parseInt(params.id) : null;
  const [showServiceForm, setShowServiceForm] = useState(false);

  // Get customer data
  const { 
    data: customer, 
    isLoading: isLoadingCustomer 
  } = useQuery<Customer & { visitCount: number }>({
    queryKey: [`/api/customers/${customerId}`],
    enabled: !!customerId,
  });

  // Handle back navigation
  const handleBack = () => {
    navigate("/");
  };

  // Handle edit customer
  const handleEditCustomer = () => {
    navigate(`/customers/${customerId}/edit`);
  };

  // Toggle service form visibility
  const toggleServiceForm = () => {
    setShowServiceForm(!showServiceForm);
  };

  if (!customerId) {
    return (
      <div className="p-8 text-center">
        <p>Không tìm thấy khách hàng.</p>
        <button className="mt-4 btn-primary" onClick={handleBack}>
          Quay lại danh sách khách hàng
        </button>
      </div>
    );
  }

  if (isLoadingCustomer) {
    return (
      <div className="flex-1 flex flex-col">
        <header className="bg-white p-4 shadow animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </header>
        <div className="p-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="card h-80 animate-pulse"></div>
            </div>
            <div className="lg:col-span-2">
              <div className="card h-80 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <p>Không tìm thấy khách hàng hoặc đã bị xóa.</p>
        <button className="mt-4 btn-primary" onClick={handleBack}>
          Quay lại danh sách khách hàng
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Customer Detail Header */}
      <header className="bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 rounded-md hover:bg-[#F5F7FA]"
              onClick={handleBack}
            >
              <ChevronLeft className="h-5 w-5 text-neutral-dark" />
            </button>
            <h2 className="text-xl font-semibold">{customer.name}</h2>
            <span className="text-neutral-medium">#{customer.id}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-neutral-dark hover:text-[#5C6BC0]" title="Call customer">
              <Phone className="h-5 w-5" />
            </button>
            <button className="text-neutral-dark hover:text-[#5C6BC0]" title="Email customer">
              <Mail className="h-5 w-5" />
            </button>
            <button 
              className="btn-secondary"
              onClick={toggleServiceForm}
            >
              <Plus className="h-5 w-5 mr-1" />
              Thêm Dịch Vụ
            </button>
            <button className="text-neutral-dark hover:text-[#5C6BC0] p-1 ml-2" title="More options">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Customer Detail Content */}
      <div className="p-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info Card */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Thông Tin Khách Hàng</h3>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-dark mb-1">Họ Tên</label>
                    <div className="font-medium">{customer.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-dark mb-1">Số Điện Thoại</label>
                    <div className="font-medium">{formatPhone(customer.phone)}</div>
                  </div>
                  {customer.birthdate && (
                    <div>
                      <label className="block text-sm text-neutral-dark mb-1">Ngày Sinh</label>
                      <div className="font-medium">{formatDate(customer.birthdate)}</div>
                    </div>
                  )}
                  {customer.address && (
                    <div>
                      <label className="block text-sm text-neutral-dark mb-1">Địa Chỉ</label>
                      <div className="font-medium whitespace-pre-line">{customer.address}</div>
                    </div>
                  )}
                  <div className="pt-2">
                    <button 
                      className="text-[#5C6BC0] hover:text-[#3F51B5] text-sm font-medium inline-flex items-center"
                      onClick={handleEditCustomer}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Sửa Thông Tin
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <CustomerSummary customerId={customer.id} visitCount={customer.visitCount} />
          </div>

          {/* Service History */}
          <div className="lg:col-span-2">
            {showServiceForm && (
              <ServiceForm 
                customerId={customer.id} 
                onCancel={toggleServiceForm} 
              />
            )}
            
            <ServiceHistory 
              customerId={customer.id}
              onAddServiceClick={toggleServiceForm}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface CustomerSummaryProps {
  customerId: number;
  visitCount: number;
}

function CustomerSummary({ customerId, visitCount }: CustomerSummaryProps) {
  const { data: summaryData } = useQuery<{
    firstVisit: string | null;
    lastVisit: string | null;
    favoriteService: string | null;
  }>({
    queryKey: [`/api/customers/${customerId}/summary`],
  });

  return (
    <div className="card mt-6">
      <div className="card-header">
        <h3 className="font-semibold">Tóm Tắt Khách Hàng</h3>
      </div>
      <div className="card-content">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#F5F7FA] rounded-lg">
            <div className="text-sm text-neutral-dark">Tổng Lượt Đến</div>
            <div className="text-xl font-semibold mt-1">{visitCount}</div>
          </div>
          <div className="p-3 bg-[#F5F7FA] rounded-lg">
            <div className="text-sm text-neutral-dark">Lần Đầu Đến</div>
            <div className="text-sm font-medium mt-1">
              {summaryData?.firstVisit ? formatDate(summaryData.firstVisit) : 'N/A'}
            </div>
          </div>
          <div className="p-3 bg-[#F5F7FA] rounded-lg">
            <div className="text-sm text-neutral-dark">Lần Cuối Đến</div>
            <div className="text-sm font-medium mt-1">
              {summaryData?.lastVisit ? formatDate(summaryData.lastVisit) : 'N/A'}
            </div>
          </div>
          <div className="p-3 bg-[#F5F7FA] rounded-lg">
            <div className="text-sm text-neutral-dark">Dịch Vụ Ưa Thích</div>
            <div className="text-sm font-medium mt-1">
              {summaryData?.favoriteService || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
