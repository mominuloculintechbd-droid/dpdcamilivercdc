import axios from 'axios'

// Use local network IP for production deployment
const API_BASE_URL = 'http://localhost:3001/api'


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
}

export default apiClient
