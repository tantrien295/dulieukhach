import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import CustomerDetailPage from "@/pages/CustomerDetailPage";
import AddCustomerPage from "@/pages/AddCustomerPage";
import ServicesPage from "@/pages/ServicesPage";
import StaffPage from "@/pages/StaffPage";
import StaffDetailPage from "@/pages/StaffDetailPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";

function Router() {
  return (
    <Layout>
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
