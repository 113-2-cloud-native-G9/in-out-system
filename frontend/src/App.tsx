import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Menu } from "./components/custom/menu";
import LoginPage from "./pages/LoginPage";
import AttendancePage from "./pages/AttendancePage";
import DashboardPage from "./pages/DashboardPage";
import OrganizationManagementPage from "./pages/OrganizationManagementPage";

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Menu className="fixed top-0 left-0 right-0 z-50" />
                <div className="container mx-auto p-4 mt-16">
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/attendance" element={<AttendancePage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/organization-management" element={<OrganizationManagementPage />} />
                        <Route path="/" element={<Navigate to="/attendance" replace />} />
                    </Routes>

                </div>
            </div>
        </Router>
    );
}

export default App;

