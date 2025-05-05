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
import { StaffMember, ServiceType, StaffMemberWithServices, StaffServiceAssignment } from "@shared/schema";

export default function StaffDetailPage() {
  const [matched, params] = useRoute("/staff/:id");
  const staffId = params?.id ? parseInt(params.id) : 0;
  const [isServiceAssignDialogOpen, setIsServiceAssignDialogOpen] = useState(false);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch staff member details
  const { data: staffMember, isLoading } = useQuery<StaffMemberWithServices>({
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
      return apiRequest(`/api/staff/${staffId}/services/${serviceTypeId}`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Đã gán dịch vụ",
        description: "Dịch vụ đã được gán cho nhân viên thành công",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/staff/${staffId}`] });
      setIsServiceAssignDialogOpen(false);
      setSelectedServiceTypeId("");
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gán dịch vụ",
        variant: "destructive"
      });
    }
  });

  // Mutation for removing service assignment
  const removeServiceMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      return apiRequest(`/api/staff/assignments/${assignmentId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Đã xóa dịch vụ",
        description: "Dịch vụ đã được xóa khỏi nhân viên thành công",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/staff/${staffId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa dịch vụ",
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
    return !assignments.some((a: StaffServiceAssignment) => a.serviceTypeId === type.id);
  });

  if (isLoading) {
    return <div className="container mx-auto py-10 text-center">Đang tải thông tin nhân viên...</div>;
  }

  if (!staffMember) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-xl font-semibold mb-4">Không tìm thấy nhân viên</h1>
        <Link href="/staff">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Danh sách Nhân viên
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
        <h1 className="text-3xl font-bold">Hồ Sơ Nhân Viên</h1>
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
              <div className="mt-1">
                <Badge>{staffMember.role}</Badge>
              </div>
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
                  <span>Ngày tham gia: {new Date(staffMember.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-center mt-4">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Sửa Hồ Sơ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {staffMember.notes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Ghi Chú</CardTitle>
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
              <CardTitle>Dịch Vụ</CardTitle>
              <Button size="sm" onClick={() => setIsServiceAssignDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Gán Dịch Vụ
              </Button>
            </CardHeader>
            <CardContent>
              {!staffMember.serviceAssignments || staffMember.serviceAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Scissors className="h-8 w-8 mx-auto mb-2" />
                  <p>Chưa có dịch vụ nào được gán</p>
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => setIsServiceAssignDialogOpen(true)}
                  >
                    Gán Dịch Vụ Đầu Tiên
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {staffMember.serviceAssignments.map((assignment: StaffServiceAssignment & { serviceType?: ServiceType & { category?: any } }) => (
                    <div key={assignment.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <h3 className="font-medium">{assignment.serviceType?.name}</h3>
                        <div className="flex text-sm text-gray-500 mt-1">
                          <Badge variant="outline" className="mr-2">
                            {assignment.serviceType?.category?.name || "Chưa phân loại"}
                          </Badge>
                          <span className="mr-2">
                            {typeof assignment.serviceType?.price === 'string' 
                              ? assignment.serviceType?.price
                              : assignment.serviceType?.price ? new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(Number(assignment.serviceType.price)) : ''}
                          </span>
                          <span>
                            {assignment.serviceType?.durationMinutes} phút
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
            <DialogTitle>Gán Dịch Vụ</DialogTitle>
            <DialogDescription>
              Chọn loại dịch vụ để gán cho {staffMember.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedServiceTypeId} onValueChange={setSelectedServiceTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn một dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {availableServiceTypes && availableServiceTypes.length > 0 ? (
                  availableServiceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name} 
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no_services" disabled>
                    Không có dịch vụ khả dụng để gán
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button 
              onClick={handleAssignService} 
              disabled={!selectedServiceTypeId || assignServiceMutation.isPending}
            >
              {assignServiceMutation.isPending ? 'Đang gán...' : 'Gán Dịch Vụ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}