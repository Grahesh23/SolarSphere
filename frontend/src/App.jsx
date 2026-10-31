import { AuthProvider, useAuth } from '@/data/AuthContext';
import { DataProvider } from '@/data/DataContext';
import { LoginPage } from '@/pages/LoginPage';
import { AdminPortal } from '@/pages/admin/AdminPortal';
import { SalesPortal } from '@/pages/sales/SalesPortal';
import { SurveyorPortal } from '@/pages/survey/SurveyorPortal';
import { WarehousePortal } from '@/pages/warehouse/WarehousePortal';
import { TechnicianPortal } from '@/pages/technician/TechnicianPortal';
import { ServicePortal } from '@/pages/service/ServicePortal';
import { FinancePortal } from '@/pages/finance/FinancePortal';
import { CustomerPortal } from '@/pages/customer/CustomerPortal';

function PortalRouter() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  switch (user.role) {
    case 'Admin': return <AdminPortal />;
    case 'Sales': return <SalesPortal />;
    case 'Surveyor': return <SurveyorPortal />;
    case 'Warehouse': return <WarehousePortal />;
    case 'Technician': return <TechnicianPortal />;
    case 'Service': return <ServicePortal />;
    case 'Finance': return <FinancePortal />;
    case 'Customer': return <CustomerPortal />;
    default: return <LoginPage />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <PortalRouter />
      </DataProvider>
    </AuthProvider>
  );
}

