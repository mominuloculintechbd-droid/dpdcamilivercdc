/**
 * Report categories configuration
 * Organizes reports by functional area with icons and metadata
 */

export const reportCategories = [
  {
    id: 'billing',
    name: 'Billing Reports',
    icon: '💵',
    reports: [
      'bill_amount_date_wise',
      'bill_amount_only_other_charges',
      'bill_amount_without_other_charges',
      'bill_missing_against_cpr',
      'bill_stop',
      'daily_bill_generated_count',
      'daily_bill_info',
      'datewise_total_bill_amt',
      'last_billing_date',
    ]
  },
  {
    id: 'customer',
    name: 'Customer Reports',
    icon: '👤',
    reports: [
      'active_customers_at_date',
      'customer_feeder_substation',
      'customer_overload_last_months',
      'customerwise_unit_and_bill',
      'customerwise_unit_and_bill_ai',
      'show_all_customer_value',
      'show_all_customer_value_2',
      'show_all_customer_value_3',
      'show_individual_customer_value',
      'show_specific_customer_value',
    ]
  },
  {
    id: 'meter',
    name: 'Meter & Device Reports',
    icon: '📊',
    reports: [
      'devices_no_reads_7_days',
      'devices_no_reads_7_days_all_meters',
      'disconnected_meter_list_mdmd',
      'lat_long',
      'meter_connection_status_check',
      'meter_migration_vs_installation_date',
      'migrated_data_list_1',
      'migrated_data_list_2',
      'monthly_reads',
      'only_meter_rent',
      'sanction_load_vs_max_demand',
    ]
  },
  {
    id: 'connectivity',
    name: 'Connectivity & Network',
    icon: '🔌',
    reports: [
      'auto_connect_disconnect_details',
      'auto_connect_disconnect_payoff_balance',
      'auto_connect_disconnect_status',
      'consumption_check_with_hes_query',
      'cpr_against_cpc_1',
      'cpr_against_cpc_2',
      'cpr_cpc_query',
      'daily_connect_disconnect_count',
      'dpdc_query_from_tech_m',
      'network_hierarchy',
      'today_disconnected_eligible_cust_count',
    ]
  },
  {
    id: 'payment',
    name: 'Payment & Recharge',
    icon: '💳',
    reports: [
      'adjustment',
      'feeder_wise_due_list',
      'no_bill_after_install',
      'payment_status_check_ict',
      'recharge_history_by_date',
      'recharge_history_details',
      'recharge_history_details_by_date',
      'recharge_history_with_message_id',
    ]
  },
  {
    id: 'operational',
    name: 'Operational Reports',
    icon: '⚡',
    reports: [
      'daily_kwh_reads',
      'daily_kwh_reads_details',
      'last_kwh_read_and_date',
      'sms_message_count_cm_smsemail',
      'sms_message_count_icx',
    ]
  },
];

/**
 * Reports that require parameters
 * These will show a settings icon
 */
export const parametricReports = [
  'bill_stop',
  'customer_overload_last_months',
];

/**
 * Get all reports as a flat array
 */
export function getAllReports() {
  return reportCategories.flatMap(category => category.reports);
}

/**
 * Get category for a specific report
 */
export function getCategoryForReport(reportName) {
  return reportCategories.find(category =>
    category.reports.includes(reportName)
  );
}

/**
 * Check if report is parametric
 */
export function isParametricReport(reportName) {
  return parametricReports.includes(reportName);
}
