
const EmployeeListPage = () => {
  const employees = [
    { id: "#EMP01", name: "Bagus Fikri", role: "CEO", department: "Managerial", status: "Active", contact: "bagusfikri@gmail.com", joined: "29 Oct, 2018" },
    { id: "#EMP02", name: "Ihdizien", role: "Illustrator", department: "Managerial", status: "Active", contact: "ihdizien@gmail.com", joined: "1 Feb, 2019" },
    // ...more employees
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Employee List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b"># ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Department</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Contact</th>
              <th className="py-2 px-4 border-b">Joined</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="py-2 px-4 border-b">{employee.id}</td>
                <td className="py-2 px-4 border-b">{employee.name}</td>
                <td className="py-2 px-4 border-b">{employee.role}</td>
                <td className="py-2 px-4 border-b">{employee.department}</td>
                <td className="py-2 px-4 border-b">{employee.status}</td>
                <td className="py-2 px-4 border-b">{employee.contact}</td>
                <td className="py-2 px-4 border-b">{employee.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeListPage;
