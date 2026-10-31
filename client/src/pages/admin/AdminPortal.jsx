import { useState } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { ExecutiveDashboard } from '@/pages/ExecutiveDashboard';
import { CustomerManagement } from '@/pages/CustomerManagement';
import { ProjectManagement } from '@/pages/ProjectManagement';
import { RoofSurveyManagement } from '@/pages/RoofSurveyManagement';
import { RoofIntelligence } from '@/pages/RoofIntelligence';
import { SolarConfigurationIntelligence } from '@/pages/SolarConfigurationIntelligence';
import { PredictiveIntelligence } from '@/pages/PredictiveIntelligence';
import { InstallationRiskIntelligence } from '@/pages/admin/InstallationRiskIntelligence';
import { QuotationsBOM } from '@/pages/QuotationsBOM';
import { InventoryManagement } from '@/pages/InventoryManagement';
import { QRIntelligence } from '@/pages/QRIntelligence';
import { DispatchManagement } from '@/pages/DispatchManagement';
import { TechnicianManagement } from '@/pages/TechnicianManagement';
import { InstallationManagement } from '@/pages/InstallationManagement';
import { WarrantyManagement } from '@/pages/WarrantyManagement';
import { ServiceComplaints } from '@/pages/ServiceComplaints';
import { PaymentsFinance } from '@/pages/PaymentsFinance';
import { SubsidyManagement } from '@/pages/SubsidyManagement';
import { AnalyticsReports } from '@/pages/AnalyticsReports';
import { UserRoleManagement } from '@/pages/UserRoleManagement';
import { SettingsPage } from '@/pages/SettingsPage';

export function AdminPortal() {
  const [active, setActive] = useState('dashboard');

  const render = () => {
    switch (active) {
      case 'dashboard': return <ExecutiveDashboard onNavigate={(k) => setActive(k)} />;
      case 'customers': return <CustomerManagement />;
      case 'projects': return <ProjectManagement />;
      case 'surveys': return <RoofSurveyManagement />;
      case 'roof-intelligence': return <RoofIntelligence />;
      case 'solar-configuration': return <SolarConfigurationIntelligence />;
      case 'predictive-intelligence': return <PredictiveIntelligence />;
      case 'risk-intelligence': return <InstallationRiskIntelligence />;
      case 'quotations': return <QuotationsBOM />;
      case 'inventory': return <InventoryManagement />;
      case 'qr-intelligence': return <QRIntelligence />;
      case 'dispatch': return <DispatchManagement />;
      case 'technicians': return <TechnicianManagement />;
      case 'installations': return <InstallationManagement />;
      case 'warranty': return <WarrantyManagement />;
      case 'service': return <ServiceComplaints />;
      case 'finance': return <PaymentsFinance />;
      case 'subsidy': return <SubsidyManagement />;
      case 'analytics': return <AnalyticsReports />;
      case 'users': return <UserRoleManagement />;
      case 'settings': return <SettingsPage />;
      default: return <ExecutiveDashboard onNavigate={(k) => setActive(k)} />;
    }
  };

  return (
    <PortalLayout active={active} onNavigate={setActive}>
      {render()}
    </PortalLayout>
  );
}
