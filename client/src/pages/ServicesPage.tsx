import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceType, ServiceCategory } from "@shared/schema";

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateServiceTypeOpen, setIsCreateServiceTypeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");

  // Fetch service categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/service-categories"],
  });

  // Fetch service types
  const { data: serviceTypes, isLoading: serviceTypesLoading } = useQuery<ServiceType[]>({
    queryKey: ["/api/service-types"],
  });

  // Filter categories based on search term
  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter service types based on search term
  const filteredServiceTypes = serviceTypes?.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services Management</h1>
        <div className="space-x-2">
          {activeTab === "categories" ? (
            <Button onClick={() => setIsCreateCategoryOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          ) : (
            <Button onClick={() => setIsCreateServiceTypeOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="categories" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="services">Service Types</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          {categoriesLoading ? (
            <div className="flex justify-center">
              <p>Loading categories...</p>
            </div>
          ) : filteredCategories?.length === 0 ? (
            <div className="text-center p-6">
              <p>No service categories found. Add your first category!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories?.map((category) => (
                <ServiceCategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="services">
          {serviceTypesLoading ? (
            <div className="flex justify-center">
              <p>Loading service types...</p>
            </div>
          ) : filteredServiceTypes?.length === 0 ? (
            <div className="text-center p-6">
              <p>No service types found. Add your first service!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServiceTypes?.map((serviceType) => (
                <ServiceTypeCard key={serviceType.id} serviceType={serviceType} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Category Dialog */}
      <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new service category to organize your services.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Category form will go here</p>
            {/* TODO: Add category form component */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Service Type Dialog */}
      <Dialog open={isCreateServiceTypeOpen} onOpenChange={setIsCreateServiceTypeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new service type with pricing and duration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Service type form will go here</p>
            {/* TODO: Add service type form component */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ServiceCategoryCardProps {
  category: ServiceCategory;
}

function ServiceCategoryCard({ category }: ServiceCategoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{category.name}</CardTitle>
        <CardDescription>{category.description || "No description"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end">
          <Button variant="outline" size="sm">Edit</Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ServiceTypeCardProps {
  serviceType: ServiceType;
}

function ServiceTypeCard({ serviceType }: ServiceTypeCardProps) {
  // Format price to currency
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Number(serviceType.price));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{serviceType.name}</CardTitle>
        <CardDescription>{serviceType.description || "No description"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Price:</span>
            <span>{formattedPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Duration:</span>
            <span>{serviceType.durationMinutes} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Category:</span>
            <span>{serviceType.category?.name || "Uncategorized"}</span>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm">Edit</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}