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
    return <div className="container mx-auto py-6 text-center">Loading reports data...</div>;
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
      <h1 className="text-3xl font-bold mb-4">Reports & Analytics</h1>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="hair">Hair</SelectItem>
              <SelectItem value="nails">Nails</SelectItem>
              <SelectItem value="facial">Facial</SelectItem>
              <SelectItem value="massage">Massage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">+2.5% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Services Performed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Service Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(averageServicePrice)}
            </div>
            <p className="text-xs text-gray-500 mt-1">-1.2% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="revenue">
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                View revenue performance over time
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
                        "Revenue"
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
              <CardTitle>Services Distribution</CardTitle>
              <CardDescription>
                Breakdown of services by type
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
                    <Bar dataKey="count" name="Services Count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Metrics</CardTitle>
              <CardDescription>
                Customer acquisition and retention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Customer metrics are in development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}