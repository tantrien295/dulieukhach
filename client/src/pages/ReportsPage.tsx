import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Service } from "@shared/schema";

export default function ReportsPage() {
  const [timeFrame, setTimeFrame] = useState("week");
  const [serviceType, setServiceType] = useState("all");
  
  // Fetch all services
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  if (isLoading) {
    return <div className="container mx-auto py-6 text-center">Đang tải dữ liệu báo cáo...</div>;
  }

  // Process data for charts
  const processDataForRevenueChart = () => {
    if (!services) return [];
    
    // Group by day and sum revenue
    const revenueByDate = services.reduce((acc: any, service) => {
      const date = new Date(service.serviceDate).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += parseFloat(service.price);
      return acc;
    }, {});
    
    // Convert to chart format
    return Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue
    }));
  };
  
  const processDataForServicesChart = () => {
    if (!services) return [];
    
    // Group by service type
    const serviceTypes = services.reduce((acc: any, service) => {
      const type = service.serviceTypeId ? service.serviceTypeId.toString() : 'Other';
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    }, {});
    
    // Convert to chart format
    return Object.entries(serviceTypes).map(([type, count]) => ({
      type,
      count
    }));
  };

  const revenueChartData = processDataForRevenueChart();
  const servicesChartData = processDataForServicesChart();
  
  // Calculate summary statistics
  const totalRevenue = services?.reduce((sum, service) => sum + parseFloat(service.price), 0) || 0;
  const totalServices = services?.length || 0;
  const averageServicePrice = totalServices > 0 ? totalRevenue / totalServices : 0;
  
  // Colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-4">Báo Cáo & Phân Tích</h1>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần</SelectItem>
              <SelectItem value="month">Tháng</SelectItem>
              <SelectItem value="quarter">Quý</SelectItem>
              <SelectItem value="year">Năm</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Loại dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả dịch vụ</SelectItem>
              <SelectItem value="hair">Tóc</SelectItem>
              <SelectItem value="nails">Móng</SelectItem>
              <SelectItem value="facial">Chăm sóc da</SelectItem>
              <SelectItem value="massage">Massage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">+2.5% so với tháng trước</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Số Dịch Vụ Đã Thực Hiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-gray-500 mt-1">+12% so với tháng trước</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Giá Dịch Vụ Trung Bình</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(averageServicePrice)}
            </div>
            <p className="text-xs text-gray-500 mt-1">-1.2% so với tháng trước</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="revenue">
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">Doanh Thu</TabsTrigger>
          <TabsTrigger value="services">Dịch Vụ</TabsTrigger>
          <TabsTrigger value="customers">Khách Hàng</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Xu Hướng Doanh Thu</CardTitle>
              <CardDescription>
                Xem hiệu suất doanh thu theo thời gian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(Number(value)),
                        "Doanh Thu"
                      ]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Phân Bổ Dịch Vụ</CardTitle>
              <CardDescription>
                Thống kê dịch vụ theo loại
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={servicesChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {servicesChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={servicesChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Số Lượng Dịch Vụ" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Thống Kê Khách Hàng</CardTitle>
              <CardDescription>
                Tỷ lệ giữ chân và thu hút khách hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Thống kê khách hàng đang được phát triển</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}