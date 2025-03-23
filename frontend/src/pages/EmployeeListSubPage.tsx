import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, User, Briefcase, Layers, Phone, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'; // Added icons
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 

// Define employee type
interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
  contact: string;
  joined: string;
}

// Define field filter options type
type FieldFilterOption = 'all' | 'name' | 'role' | 'id' | 'contact';

// Define sort direction type
type SortDirection = 'asc' | 'desc' | null;

// Define sort field type
type SortField = keyof Employee | null;

const EmployeeListPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');
  const [selectedField, setSelectedField] = useState<FieldFilterOption>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [editingEmployee, setEditingEmployee] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const itemsPerPage: number = 10;

  // Example employee data
  const employees: Employee[] = [
    { id: '#EMP01', name: 'Bagus Fikri', role: 'CEO', department: 'Managerial', status: 'Active', contact: 'bagusfikri@gmail.com', joined: '29 Oct, 2018' },
    { id: '#EMP02', name: 'Ihdiezin', role: 'Illustrator', department: 'Design', status: 'Active', contact: 'ihdiezin@gmail.com', joined: '1 Feb, 2019' },
    { id: '#EMP03', name: 'Mufti Hidayat', role: 'Project Manager', department: 'Managerial', status: 'Active', contact: 'mufthi@gmail.com', joined: '21 Sep, 2018' },
    { id: '#EMP04', name: 'Aisha Khan', role: 'Developer', department: 'Engineering', status: 'Active', contact: 'aisha@gmail.com', joined: '15 Apr, 2020' },
    { id: '#EMP05', name: 'Sam Wilson', role: 'Designer', department: 'Design', status: 'Active', contact: 'sam@gmail.com', joined: '3 Jan, 2021' },
  ];

  // Get unique departments for the department filter
  const departments: string[] = ['all', ...Array.from(new Set(employees.map(emp => emp.department)))];
  
  // Filter the employees based on all criteria
  const filteredEmployees: Employee[] = employees.filter(employee => {
    // Status filter
    const statusMatch: boolean = employee.status === selectedStatus;
    
    // Search query filter based on selected field
    let searchMatch: boolean = true;
    if (searchQuery) {
      if (selectedField === 'all') {
        searchMatch = Object.values(employee).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        searchMatch = employee[selectedField]?.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) || false;
      }
    }
    
    // Department filter
    const departmentMatch: boolean = selectedDepartment === 'all' || employee.department === selectedDepartment;
    
    return statusMatch && searchMatch && departmentMatch;
  });

  // Sort filtered employees if sort field and direction are set
  const sortedEmployees: Employee[] = [...filteredEmployees].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    const valueA = a[sortField].toLowerCase();
    const valueB = b[sortField].toLowerCase();

    if (sortDirection === 'asc') {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  // Get paginated data
  const indexOfLastEmployee: number = currentPage * itemsPerPage;
  const indexOfFirstEmployee: number = indexOfLastEmployee - itemsPerPage;
  const currentEmployees: Employee[] = sortedEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  // Pagination logic
  const totalPages: number = Math.ceil(sortedEmployees.length / itemsPerPage);

  const handlePageChange = (pageNumber: number): void => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle the click of the edit icon
  const handleEdit = (employeeId: number): void => {
    setEditingEmployee(employeeId);
    console.log(`Editing employee with ID: ${employeeId}`);
  };

  // Handle sorting
  const handleSort = (field: keyof Employee): void => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      // Set new field and direction to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Function to render sort icon
  const renderSortIcon = (field: keyof Employee): JSX.Element | null => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    }
    
    if (sortDirection === 'asc') {
      return <ArrowUp size={14} className="ml-1" />;
    }
    
    if (sortDirection === 'desc') {
      return <ArrowDown size={14} className="ml-1" />;
    }
    
    return null;
  };

  return (
    <div className="px-6 py-6">
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Search input */}
          <Input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-popover/20"
          />
          
          {/* Field filter */}
          <Select
            value={selectedField}
            onValueChange={(value: string) => setSelectedField(value as FieldFilterOption)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fields</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="role">Role</SelectItem>
              <SelectItem value="id">ID</SelectItem>
              <SelectItem value="joined">Joined</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Department filter */}
          <Select
            value={selectedDepartment}
            onValueChange={(value: string) => setSelectedDepartment(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Status filter */}
          <Select
            value={selectedStatus}
            onValueChange={(value: string) => setSelectedStatus(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-accent hover:bg-accent/70">Add Employee</Button>
        </div>
      </div>

      {/* Table using Shadcn components */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-border">
              <TableHead 
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  # ID {renderSortIcon('id')}
                </div>
              </TableHead>
              <TableHead 
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <User size={14} className="mr-2" /> Name {renderSortIcon('name')}
                </div>
              </TableHead>
              <TableHead 
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center">
                  <Briefcase size={14} className="mr-2" /> Role {renderSortIcon('role')}
                </div>
              </TableHead>
              <TableHead 
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center">
                  <Layers size={14} className="mr-2" /> Department {renderSortIcon('department')}
                </div>
              </TableHead>
              <TableHead 
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  <Phone size={14} className="mr-2" /> Status {renderSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort('contact')}
              >
                <div className="flex items-center">
                  <Calendar size={14} className="mr-2" /> Contact {renderSortIcon('contact')}
                </div>
              </TableHead>
              <TableHead 
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort('joined')}
              >
                <div className="flex items-center">
                  <Calendar size={14} className="mr-2" /> Contact {renderSortIcon('joined')}
                </div>
              </TableHead>
              <TableHead className="px-4 py-2">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEmployees.length > 0 ? (
              currentEmployees.map((employee, index) => (
                <TableRow key={employee.id} className="hover:bg-chart-1/20">
                  <TableCell className="px-4 py-2">{employee.id}</TableCell>
                  <TableCell className="px-4 py-2">{employee.name}</TableCell>
                  <TableCell className="px-4 py-2">{employee.role}</TableCell>
                  <TableCell className="px-4 py-2">{employee.department}</TableCell>
                  <TableCell className="px-4 py-2">{employee.status}</TableCell>
                  <TableCell className="px-4 py-2">{employee.contact}</TableCell>
                  <TableCell className="px-4 py-2">{employee.joined}</TableCell>
                  <TableCell className="px-8 py-2">
                    <Edit
                      size={16}
                      className="text-secondary cursor-pointer hover:text-primary"
                      onClick={() => handleEdit(index)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  No employees match the current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-2">
          {currentPage > 1 && (
            <span
              className="text-sm cursor-pointer"
              onClick={() => handlePageChange(1)}
            >
              1
            </span>
          )}
          {currentPage > 2 && <span className="text-sm text-secondary/50">...</span>}
          <span className="text-sm font-semibold text-secondary">{currentPage}</span>
          {currentPage < totalPages - 1 && <span className="text-sm text-secondary/50">...</span>}
          {currentPage < totalPages && (
            <span
              className="text-sm cursor-pointer"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </span>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default EmployeeListPage;
