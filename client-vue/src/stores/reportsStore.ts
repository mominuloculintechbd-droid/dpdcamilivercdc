import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reportsApi } from '../services/api'

export interface MeterCommand {
  NOCS_NAME: string
  MSN: string
  OLD_CONSUMER_ID: string
  COMMAND_TYPE: string
  COMMAND_STATUS: string
  DATE_OF_COMMAND_TRIGGER: string
  PAYOFF_BALNCE: number
}

export interface NocsData {
  nocsName: string
  rcSuccess: number
  rcInProgress: number
  dcSuccess: number
  dcInProgress: number
  dcFailed: number
  total: number
}

export interface Analytics {
  rcSuccess: number
  rcInProgress: number
  dcSuccess: number
  dcInProgress: number
  dcFailed: number
  totalCommands: number
  lastUpdated: Date | null
}

export const useReportsStore = defineStore('reports', () => {
  // Meter-wise command data
  const meterData = ref<MeterCommand[]>([])
  const meterDataLoading = ref(false)
  const meterDataError = ref<string | null>(null)
  const meterDataLastUpdated = ref<Date | null>(null)

  // NOCS analytics data
  const analytics = ref<Analytics>({
    rcSuccess: 0,
    rcInProgress: 0,
    dcSuccess: 0,
    dcInProgress: 0,
    dcFailed: 0,
    totalCommands: 0,
    lastUpdated: null
  })
  const nocsData = ref<NocsData[]>([])
  const analyticsLoading = ref(false)
  const analyticsError = ref<string | null>(null)

  // Fetch meter-wise commands
  const fetchMeterData = async () => {
    meterDataLoading.value = true
    meterDataError.value = null

    try {
      const response = await reportsApi.getMeterWiseCommands()
      meterData.value = response.data
      meterDataLastUpdated.value = new Date()
      meterDataError.value = null
      return { success: true, message: 'Meter data refreshed successfully' }
    } catch (err: any) {
      console.error('Error fetching meter data:', err)
      const errorMsg = err.response?.data || err.message
      meterDataError.value = errorMsg
      return { success: false, message: 'Failed to fetch meter data' }
    } finally {
      meterDataLoading.value = false
    }
  }

  // Fetch NOCS analytics - OPTIMIZED VERSION
  // Database now returns pre-aggregated data, eliminating client-side processing
  const fetchAnalytics = async () => {
    analyticsLoading.value = true
    analyticsError.value = null

    try {
      const response = await reportsApi.getRCDCAnalytics()
      const data = response.data

      // Data is already aggregated by the database - just map and sum
      const nocsArray: NocsData[] = data.map((row: any) => ({
        nocsName: row.NOCS_NAME?.trim() || 'Unknown',
        rcSuccess: row.RC_SUCCESS || 0,
        rcInProgress: row.RC_IN_PROGRESS || 0,
        dcSuccess: row.DC_SUCCESS || 0,
        dcInProgress: row.DC_IN_PROGRESS || 0,
        dcFailed: row.DC_FAILED || 0,
        total: row.TOTAL || 0
      }))

      // Calculate overall statistics by summing NOCS totals
      const stats: Analytics = {
        rcSuccess: nocsArray.reduce((sum, nocs) => sum + nocs.rcSuccess, 0),
        rcInProgress: nocsArray.reduce((sum, nocs) => sum + nocs.rcInProgress, 0),
        dcSuccess: nocsArray.reduce((sum, nocs) => sum + nocs.dcSuccess, 0),
        dcInProgress: nocsArray.reduce((sum, nocs) => sum + nocs.dcInProgress, 0),
        dcFailed: nocsArray.reduce((sum, nocs) => sum + nocs.dcFailed, 0),
        totalCommands: nocsArray.reduce((sum, nocs) => sum + nocs.total, 0),
        lastUpdated: new Date()
      }

      analytics.value = stats
      nocsData.value = nocsArray
      analyticsError.value = null

      return { success: true, message: 'Analytics data refreshed successfully' }
    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      const errorMsg = err.response?.data || err.message
      analyticsError.value = errorMsg
      return { success: false, message: 'Failed to fetch analytics data' }
    } finally {
      analyticsLoading.value = false
    }
  }

  // Fetch all data
  const fetchAllData = async () => {
    const results = await Promise.all([
      fetchMeterData(),
      fetchAnalytics()
    ])

    const allSuccess = results.every(r => r.success)
    return {
      success: allSuccess,
      message: allSuccess ? 'All data refreshed successfully' : 'Some data failed to refresh'
    }
  }

  return {
    // Meter data
    meterData,
    meterDataLoading,
    meterDataError,
    meterDataLastUpdated,
    fetchMeterData,

    // Analytics data
    analytics,
    nocsData,
    analyticsLoading,
    analyticsError,
    fetchAnalytics,

    // Combined
    fetchAllData
  }
})
