import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, Pie } from "recharts";
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  Download,
  Calendar,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Cell 
} from "recharts";
import { Customer, Service, ServiceType } from "@shared/schema";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Function to group services by name and count occurrences
const groupServicesByName = (services: Service[]) => {
  const grouped = services.reduce((acc: {[key: string]: number}, service) => {
    const name = service.serviceName;
    if (!acc[name]) {
      acc[name] = 0;
    }
    acc[name]++;
    return acc;
  }, {});
  
  return Object.entries(grouped).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count);
};

// Function to group customers by visit count
const groupCustomersByVisitCount = (customers: any[]) => {
  return customers
    .filter(customer => customer.visitCount > 0)
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 10)
    .map(customer => ({
      name: customer.name,
      visits: customer.visitCount
    }));
};

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("all");

  // Fetch all customers with summary
  const { data: customers } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch all services
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Prepare data for popular services chart
  const popularServicesData = services ? groupServicesByName(services) : [];

  // Prepare data for top customers chart
  const topCustomersData = customers ? groupCustomersByVisitCount(customers) : [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <User className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customers?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Customers in database
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <BarChartIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{services?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Services performed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Services Per Customer</CardTitle>
            <PieChartIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {customers && customers.length && services && services.length
                ? (services.length / customers.length).toFixed(1)
                : "0.0"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Services per customer
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="popular-services">
        <TabsList>
          <TabsTrigger value="popular-services">Popular Services</TabsTrigger>
          <TabsTrigger value="top-customers">Top Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="popular-services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Services</CardTitle>
              <CardDescription>
                Service popularity based on frequency of bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {servicesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <p>Loading service data...</p>
                </div>
              ) : popularServicesData.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p>No service data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularServicesData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Number of Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="top-customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Visit Count</CardTitle>
              <CardDescription>
                Customers with the highest number of visits
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {!customers ? (
                <div className="flex justify-center items-center h-full">
                  <p>Loading customer data...</p>
                </div>
              ) : topCustomersData.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p>No customer visit data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCustomersData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visits" fill="#82ca9d" name="Number of Visits" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}