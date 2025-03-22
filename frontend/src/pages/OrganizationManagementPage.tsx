import { Link, Route, Routes } from "react-router-dom";
import EmployeeListPage from "./EmployeeListPage";

const OrganizationManagementPage = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background p-4 space-y-4">
        <h2 className="text-xl font-bold">Menu</h2>
        <nav className="space-y-2">
          <Link
            to="/employee-list"
            className="block px-4 py-2 rounded-md text-foreground hover:bg-popover"
          >
            Employee List
          </Link>
          <Link
            to="/organization/organization-structure"
            className="block px-4 py-2 rounded-md text-foreground hover:bg-popover"
          >
            Organization Structure
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-3xl font-bold">Organization Management</h1>
        
      </main>
    </div>
  );
};

export default OrganizationManagementPage;