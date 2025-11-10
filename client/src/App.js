import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReportPage from './pages/ReportPage';

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

const App = () => {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <nav style={{ width: '250px', borderRight: '1px solid #ccc', padding: '1rem' }}>
          <h2>Reports</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {reports.map(report => (
              <li key={report} style={{ margin: '0.5rem 0' }}>
                <Link to={`/reports/${report}`}>{report.replace(/_/g, ' ')}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <main style={{ flex: 1, padding: '1rem' }}>
          <Routes>
            <Route path="/reports/:reportName" element={<ReportPage />} />
            <Route path="/" element={<div>Select a report to view</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;