import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StaffMember, ServiceType, StaffMemberWithServices } from "@shared/schema";

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);

  // Fetch staff members
  const { data: staffMembers, isLoading } = useQuery<StaffMemberWithServices[]>({
    queryKey: ["/api/staff"],
  });

  // Filter staff based on search term
  const filteredStaff = staffMembers?.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản Lý Nhân Viên</h1>
        <Button onClick={() => setIsCreateStaffOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm Nhân Viên
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm nhân viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <p>Đang tải dữ liệu nhân viên...</p>
        </div>
      ) : filteredStaff?.length === 0 ? (
        <div className="text-center p-6">
          <p>Không tìm thấy nhân viên nào. Hãy thêm nhân viên đầu tiên!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff?.map((staff) => (
            <StaffCard key={staff.id} staff={staff} />
          ))}
        </div>
      )}

      {/* Create Staff Dialog */}
      <Dialog open={isCreateStaffOpen} onOpenChange={setIsCreateStaffOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Nhân Viên Mới</DialogTitle>
            <DialogDescription>
              Tạo hồ sơ nhân viên mới với thông tin liên hệ và gán dịch vụ.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Biểu mẫu nhân viên sẽ hiển thị ở đây</p>
            {/* TODO: Add staff form component */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface StaffCardProps {
  staff: StaffMemberWithServices;
}

function StaffCard({ staff }: StaffCardProps) {
  // Get service assignments
  const serviceAssignments = staff.serviceAssignments || [];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={staff.photoUrl || undefined} alt={staff.name} />
          <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{staff.name}</CardTitle>
          <CardDescription>{staff.role}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {staff.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <span>{staff.phone}</span>
            </div>
          )}
          {staff.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <span>{staff.email}</span>
            </div>
          )}
          
          {serviceAssignments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Dịch Vụ</h4>
              <div className="flex flex-wrap gap-2">
                {serviceAssignments.slice(0, 3).map((assignment, index: number) => (
                  <Badge key={index} variant="outline">
                    {assignment.serviceType?.name || 'Dịch vụ không xác định'}
                  </Badge>
                ))}
                {serviceAssignments.length > 3 && (
                  <Badge variant="outline">+{serviceAssignments.length - 3} khác</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Link href={`/staff/${staff.id}`}>
          <Button variant="outline" size="sm">Xem Hồ Sơ</Button>
        </Link>
        <Button variant="outline" size="sm">Sửa</Button>
      </CardFooter>
    </Card>
  );
}