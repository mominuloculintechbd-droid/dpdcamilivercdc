import axios from 'axios'

// Use local network IP for production deployment
const API_BASE_URL = 'http://172.16.20.112:3001/api'


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const reportsApi = {
  getRCDCAnalytics: () => {
    return apiClient.get('/reports/rc_dc_analytics_summary')
  },
  getMeterWiseCommands: () => {
    return apiClient.get('/reports/meter_wise_commands')
  },
}

export default apiClient
