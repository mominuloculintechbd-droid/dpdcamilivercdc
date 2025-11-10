import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ReportPage from './pages/ReportPage';
import { ScrollArea } from './components/ui/scroll-area';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';

const reports = [
  "active_customers_at_date",
  "adjustment",
  "auto_connect_disconnect_details",
  "auto_connect_disconnect_payoff_balance",
  "auto_connect_disconnect_status",
  "bill_amount_date_wise",
  "bill_amount_only_other_charges",
  "bill_amount_without_other_charges",
  "bill_missing_against_cpr",
  "bill_stop",
  "consumption_check_with_hes_query",
  "cpr_against_cpc_1",
  "cpr_against_cpc_2",
  "cpr_cpc_query",
  "customer_feeder_substation",
  "customerwise_unit_and_bill_ai",
  "customerwise_unit_and_bill",
  "daily_bill_generated_count",
  "daily_bill_info",
  "daily_connect_disconnect_count",
  "daily_kwh_reads_details",
  "daily_kwh_reads",
  "datewise_total_bill_amt",
  "devices_no_reads_7_days_all_meters",
  "devices_no_reads_7_days",
  "disconnected_meter_list_mdmd",
  "dpdc_query_from_tech_m",
  "feeder_wise_due_list",
  "last_billing_date",
  "last_kwh_read_and_date",
  "lat_long",
  "meter_connection_status_check",
  "meter_migration_vs_installation_date",
  "migrated_data_list_1",
  "migrated_data_list_2",
  "monthly_reads",
  "network_hierarchy",
  "no_bill_after_install",
  "only_meter_rent",
  "payment_status_check_ict",
  "recharge_history_by_date",
  "recharge_history_details_by_date",
  "recharge_history_details",
  "recharge_history_with_message_id",
  "sanction_load_vs_max_demand",
  "show_all_customer_value_2",
  "show_all_customer_value_3",
  "show_all_customer_value",
  "show_individual_customer_value",
  "show_specific_customer_value",
  "sms_message_count_cm_smsemail",
  "sms_message_count_icx",
  "today_disconnected_eligible_cust_count"
];

const NavigationItem = ({ report, isActive }) => {
  return (
    <Link to={`/reports/${report}`} className="block">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start text-left font-normal",
          isActive && "bg-gray-100 text-gray-900 font-medium"
        )}
      >
        {report.replace(/_/g, ' ')}
      </Button>
    </Link>
  );
};

const Navigation = () => {
  const location = useLocation();
  const currentReport = location.pathname.split('/reports/')[1];

  return (
    <nav className="w-64 border-r border-gray-200 bg-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500 mt-1">{reports.length} reports available</p>
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {reports.map(report => (
            <NavigationItem
              key={report}
              report={report}
              isActive={currentReport === report}
            />
          ))}
        </div>
      </ScrollArea>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto p-6">
            <Routes>
              <Route path="/reports/:reportName" element={<ReportPage />} />
              <Route path="/" element={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Oracle Reporting Dashboard</h1>
                    <p className="text-gray-600">Select a report from the navigation to view data</p>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;