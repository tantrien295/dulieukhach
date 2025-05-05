import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Plus } from "lucide-react";
import CustomerList from "@/components/CustomerList";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();

  const handleAddCustomer = () => {
    navigate("/customers/new");
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Section */}
      <header className="bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Customers</h2>
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or phone..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-neutral-medium">
                <Search className="h-5 w-5" />
              </div>
            </div>
            
            <button 
              className="btn-primary"
              onClick={handleAddCustomer}
            >
              <Plus className="h-5 w-5 mr-1" />
              Add Customer
            </button>
          </div>
        </div>
      </header>

      {/* Customer List */}
      <CustomerList searchTerm={searchTerm} />
    </div>
  );
}
