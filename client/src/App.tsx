import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load các trang để giảm kích thước bundle ban đầu
const NotFound = lazy(() => import("@/pages/not-found"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const CustomerDetailPage = lazy(() => import("@/pages/CustomerDetailPage"));
const AddCustomerPage = lazy(() => import("@/pages/AddCustomerPage"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const StaffPage = lazy(() => import("@/pages/StaffPage"));
const StaffDetailPage = lazy(() => import("@/pages/StaffDetailPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

// Component hiển thị trong khi trang đang tải
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Đang tải...</span>
    </div>
  </div>
);

function Router() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/customers/new" component={AddCustomerPage} />
          <Route path="/customers/:id" component={CustomerDetailPage} />
          <Route path="/services" component={ServicesPage} />
          <Route path="/staff" component={StaffPage} />
          <Route path="/staff/:id" component={StaffDetailPage} />
          <Route path="/reports" component={ReportsPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
