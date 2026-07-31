import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EmployeeList } from './pages/Employees/EmployeeList';
import { EmployeeForm } from './pages/Employees/EmployeeForm';
import { EmployeeDetail } from './pages/Employees/EmployeeDetail';
import { DepartmentList } from './pages/Departments/DepartmentList';
import { AttendanceDashboard } from './pages/Attendance/AttendanceDashboard';
import { AttendanceLogs } from './pages/Attendance/AttendanceLogs';
import { ShiftManagement } from './pages/Attendance/ShiftManagement';
import { LeaveDashboard } from './pages/Leave/LeaveDashboard';
import { LeaveRequestList } from './pages/Leave/LeaveRequestList';
import { LeaveRequestForm } from './pages/Leave/LeaveRequestForm';
import { LeavePolicies } from './pages/Leave/LeavePolicies';
import { PayrollDashboard } from './pages/Payroll/PayrollDashboard';
import { PayrollRunList } from './pages/Payroll/PayrollRunList';
import { PayrollRunDetail } from './pages/Payroll/PayrollRunDetail';
import { PayrollSimulator } from './pages/Payroll/PayrollSimulator';
import { PerformanceDashboard } from './pages/Performance/PerformanceDashboard';
import { PerformanceReviewList } from './pages/Performance/PerformanceReviewList';
import { PerformanceReviewForm } from './pages/Performance/PerformanceReviewForm';
import { NineBoxMatrix } from './pages/Performance/NineBoxMatrix';
import { ManpowerDashboard } from './pages/Manpower/ManpowerDashboard';
import { MPPPlanList } from './pages/Manpower/MPPPlanList';
import { MPPPlanForm } from './pages/Manpower/MPPPlanForm';
import { FPTKList } from './pages/Manpower/FPTKList';
import { FPTKForm } from './pages/Manpower/FPTKForm';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="/departments" element={<DepartmentList />} />
        <Route path="/attendance" element={<AttendanceDashboard />} />
        <Route path="/attendance/logs" element={<AttendanceLogs />} />
        <Route path="/attendance/shifts" element={<ShiftManagement />} />
        <Route path="/leave" element={<LeaveDashboard />} />
        <Route path="/leave/requests" element={<LeaveRequestList />} />
        <Route path="/leave/new" element={<LeaveRequestForm />} />
        <Route path="/leave/policies" element={<LeavePolicies />} />
        <Route path="/payroll" element={<PayrollDashboard />} />
        <Route path="/payroll/runs" element={<PayrollRunList />} />
        <Route path="/payroll/runs/new" element={<PayrollDashboard />} />
        <Route path="/payroll/runs/:id" element={<PayrollRunDetail />} />
        <Route path="/payroll/simulator" element={<PayrollSimulator />} />
        <Route path="/performance" element={<PerformanceDashboard />} />
        <Route path="/performance/reviews" element={<PerformanceReviewList />} />
        <Route path="/performance/new" element={<PerformanceReviewForm />} />
        <Route path="/performance/matrix" element={<NineBoxMatrix />} />
        <Route path="/manpower" element={<ManpowerDashboard />} />
        <Route path="/manpower/plans" element={<MPPPlanList />} />
        <Route path="/manpower/plans/new" element={<MPPPlanForm />} />
        <Route path="/manpower/fptk" element={<FPTKList />} />
        <Route path="/manpower/fptk/new" element={<FPTKForm />} />
      </Route>
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
