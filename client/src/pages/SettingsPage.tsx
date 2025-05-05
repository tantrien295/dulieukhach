import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Save, Building, Palette, Database, Lock } from "lucide-react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  
  // Business profile state
  const [businessName, setBusinessName] = useState("BeautyTrack Salon & Spa");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  
  // UI settings state
  const [primaryColor, setPrimaryColor] = useState("#5C6BC0");
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  // Handle saving business profile
  const handleSaveBusinessProfile = () => {
    // This would be an API call in a real implementation
    toast({
      title: "Settings saved",
      description: "Your business profile has been updated",
    });
  };

  // Handle saving UI settings
  const handleSaveUISettings = () => {
    // This would be an API call in a real implementation
    toast({
      title: "UI settings saved",
      description: "Your UI preferences have been updated",
    });
  };

  // Handle backup
  const handleBackup = () => {
    toast({
      title: "Backup started",
      description: "Your database backup has been initiated",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="business-profile">
        <TabsList className="mb-6">
          <TabsTrigger value="business-profile">Business Profile</TabsTrigger>
          <TabsTrigger value="ui-settings">UI & Appearance</TabsTrigger>
          <TabsTrigger value="data-management">Data Management</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="business-profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Business Profile
              </CardTitle>
              <CardDescription>
                Manage your business information that appears throughout the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Phone Number</Label>
                  <Input
                    id="business-phone"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-email">Email Address</Label>
                  <Input
                    id="business-email"
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-address">Address</Label>
                  <Input
                    id="business-address"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-description">Description</Label>
                <Textarea
                  id="business-description"
                  rows={4}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Briefly describe your business..."
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveBusinessProfile}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="ui-settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                UI & Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode" className="block">Dark Mode</Label>
                    <p className="text-sm text-gray-500">Use dark color scheme</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-mode" className="block">Compact Mode</Label>
                    <p className="text-sm text-gray-500">Reduce padding and spacing</p>
                  </div>
                  <Switch
                    id="compact-mode"
                    checked={compactMode}
                    onCheckedChange={setCompactMode}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveUISettings}>
                <Save className="h-4 w-4 mr-2" />
                Save UI Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="data-management">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data Management
              </CardTitle>
              <CardDescription>
                Backup, restore, and manage your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Database Backup</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Create a backup of your entire database including customers, services, and configuration.
                </p>
                <Button onClick={handleBackup}>
                  Create Backup
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Export Data</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Export specific data as CSV or Excel file
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="staff">Staff Members</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Security
              </CardTitle>
              <CardDescription>
                Manage security settings and access control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Access Control</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Manage who can access the system and what they can do
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-login" className="block">Require Login</Label>
                    <p className="text-sm text-gray-500">Require users to log in</p>
                  </div>
                  <Switch
                    id="require-login"
                    defaultChecked={true}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-2">Data Privacy</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Configure data privacy settings
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="encrypt-data" className="block">Encrypt Sensitive Data</Label>
                    <p className="text-sm text-gray-500">Encrypt customer personal information</p>
                  </div>
                  <Switch
                    id="encrypt-data"
                    defaultChecked={true}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}