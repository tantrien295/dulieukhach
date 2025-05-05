import { Link, useLocation } from "wouter";
import { 
  UserCircle, 
  Scissors, 
  Users, 
  BarChart3, 
  Settings
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className="bg-white w-full lg:w-64 border-r border-neutral-light lg:min-h-screen">
      <div className="p-4 border-b border-neutral-light flex items-center justify-between lg:justify-center">
        <h1 className="text-xl font-semibold text-[#5C6BC0]">BeautyTrack</h1>
        <button className="lg:hidden text-neutral-dark">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
      <nav className="p-2">
        <ul>
          <li className="mb-1">
            <Link href="/">
              <a className={isActive("/") ? "nav-link-active" : "nav-link"}>
                <UserCircle className="h-5 w-5 mr-3" />
                Customers
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/services">
              <a className={isActive("/services") ? "nav-link-active" : "nav-link"}>
                <Scissors className="h-5 w-5 mr-3" />
                Services
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/staff">
              <a className={isActive("/staff") ? "nav-link-active" : "nav-link"}>
                <Users className="h-5 w-5 mr-3" />
                Staff
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/reports">
              <a className={isActive("/reports") ? "nav-link-active" : "nav-link"}>
                <BarChart3 className="h-5 w-5 mr-3" />
                Reports
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/settings">
              <a className={isActive("/settings") ? "nav-link-active" : "nav-link"}>
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </a>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
