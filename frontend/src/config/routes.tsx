import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import LoginPage from "@/pages/LoginPage";
import AttendancePage from "@/pages/AttendancePage";
import DashboardPage from "@/pages/DashboardPage";
import OrganizationManagementPage from "@/pages/OrganizationManagementPage";
import EmployeeListPage from '@/pages/EmployeeListSubPage';

type AppRoute = Omit<RouteObject, 'path'> & {
  path: string;
  name?: string;
  showInMenu?: boolean;
}

export const routes: AppRoute[] = [
  {
    path: '/login',
    element: <LoginPage />,
    showInMenu: false
  },
  {
    path: '/attendance',
    element: <AttendancePage />,
    name: 'Attendance Records',
    showInMenu: true
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
    name: 'Manager Dashboard',
    showInMenu: true
  },
  {
    path: '/organization-management',
    element: <OrganizationManagementPage />,
    name: 'Organization Management',
    showInMenu: true
  },
  {
    path: '/',
    element: <Navigate to="/attendance" replace />,
    showInMenu: false
  }
];

export const menuItems = routes
  .filter(route => route.showInMenu && route.name)
  .map(route => ({
    name: route.name!,
    path: route.path,
    count: null
  })); 