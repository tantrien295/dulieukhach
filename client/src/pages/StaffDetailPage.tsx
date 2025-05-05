import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  Scissors, 
  Edit, 
  Plus,
  Trash
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StaffMember, ServiceType } from "@shared/schema";

export default function StaffDetailPage() {
  const [matched, params] = useRoute("/staff/:id");
  const staffId = params?.id ? parseInt(params.id) : 0;
  const [isServiceAssignDialogOpen, setIsServiceAssignDialogOpen] = useState(false);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch staff member details
  const { data: staffMember, isLoading } = useQuery<StaffMember>({
    queryKey: [`/api/staff/${staffId}`],
    enabled: !!staffId
  });

  // Fetch all service types for assignment
  const { data: serviceTypes } = useQuery<ServiceType[]>({
    queryKey: ["/api/service-types"],
  });

  // Mutation for assigning service to staff
  const assignServiceMutation = useMutation({
    mutationFn: async (serviceTypeId: number) => {
      return apiRequest(`/api/staff/${staffId}/services/${serviceTypeId}`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      toast({
        title: "Service assigned",
        description: "Service has been assigned to staff member successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/staff/${staffId}`] });
      setIsServiceAssignDialogOpen(false);
      setSelectedServiceTypeId("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign service",
        variant: "destructive"
      });
    }
  });

  // Mutation for removing service assignment
  const removeServiceMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      return apiRequest(`/api/staff/assignments/${assignmentId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      toast({
        title: "Service removed",
        description: "Service has been removed from staff member successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/staff/${staffId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove service",
        variant: "destructive"
      });
    }
  });

  const handleAssignService = () => {
    if (selectedServiceTypeId) {
      assignServiceMutation.mutate(parseInt(selectedServiceTypeId));
    }
  };

  const handleRemoveService = (assignmentId: number) => {
    removeServiceMutation.mutate(assignmentId);
  };

  // Filter out already assigned services
  const availableServiceTypes = serviceTypes?.filter(type => {
    const assignments = staffMember?.serviceAssignments || [];
    return !assignments.some(a => a.serviceTypeId === type.id);
  });

  if (isLoading) {
    return <div className="container mx-auto py-10 text-center">Loading staff details...</div>;
  }

  if (!staffMember) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-xl font-semibold mb-4">Staff member not found</h1>
        <Link href="/staff">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/staff">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Staff Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Card>
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={staffMember.photoUrl || undefined} alt={staffMember.name} />
                <AvatarFallback>{staffMember.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-2">{staffMember.name}</CardTitle>
              <CardDescription>
                <Badge>{staffMember.role}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffMember.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{staffMember.phone}</span>
                  </div>
                )}
                {staffMember.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{staffMember.email}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Joined {new Date(staffMember.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-center mt-4">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {staffMember.notes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{staffMember.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Services</CardTitle>
              <Button size="sm" onClick={() => setIsServiceAssignDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Assign Service
              </Button>
            </CardHeader>
            <CardContent>
              {!staffMember.serviceAssignments || staffMember.serviceAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Scissors className="h-8 w-8 mx-auto mb-2" />
                  <p>No services assigned yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => setIsServiceAssignDialogOpen(true)}
                  >
                    Assign First Service
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {staffMember.serviceAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <h3 className="font-medium">{assignment.serviceType?.name}</h3>
                        <div className="flex text-sm text-gray-500 mt-1">
                          <Badge variant="outline" className="mr-2">
                            {assignment.serviceType?.category?.name || "Uncategorized"}
                          </Badge>
                          <span className="mr-2">
                            {typeof assignment.serviceType?.price === 'number' 
                              ? new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(assignment.serviceType.price)
                              : assignment.serviceType?.price}
                          </span>
                          <span>
                            {assignment.serviceType?.durationMinutes} min
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveService(assignment.id)}
                      >
                        <Trash className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Service Dialog */}
      <Dialog open={isServiceAssignDialogOpen} onOpenChange={setIsServiceAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Service</DialogTitle>
            <DialogDescription>
              Select a service type to assign to {staffMember.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedServiceTypeId} onValueChange={setSelectedServiceTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {availableServiceTypes && availableServiceTypes.length > 0 ? (
                  availableServiceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name} ({type.category?.name})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no_services" disabled>
                    No available services to assign
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAssignService} 
              disabled={!selectedServiceTypeId || assignServiceMutation.isPending}
            >
              {assignServiceMutation.isPending ? 'Assigning...' : 'Assign Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}