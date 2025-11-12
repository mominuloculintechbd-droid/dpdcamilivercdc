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

  // Fetch NOCS analytics
  const fetchAnalytics = async () => {
    analyticsLoading.value = true
    analyticsError.value = null

    try {
      const response = await reportsApi.getRCDCAnalytics()
      const data = response.data

      // Process the data to calculate analytics
      const stats: Analytics = {
        rcSuccess: 0,
        rcInProgress: 0,
        dcSuccess: 0,
        dcInProgress: 0,
        dcFailed: 0,
        totalCommands: data.length,
        lastUpdated: new Date()
      }

      // Calculate NOCS-wise statistics
      const nocsMap: Record<string, NocsData> = {}

      data.forEach((row: any) => {
        const commandType = row.COMMAND_TYPE?.trim()
        const commandStatus = row.COMMAND_STATUS?.trim()
        const nocsName = row.NOCS_NAME?.trim() || 'Unknown'

        // Overall stats
        if (commandType === 'D1-RemoteConnect' && commandStatus === 'COMPLETED') {
          stats.rcSuccess++
        } else if (commandType === 'D1-RemoteConnect' && commandStatus === 'COMINPROG') {
          stats.rcInProgress++
        } else if (commandType === 'D1-RemoteDisconnect' && commandStatus === 'COMPLETED') {
          stats.dcSuccess++
        } else if (commandType === 'D1-RemoteDisconnect' && commandStatus === 'COMINPROG') {
          stats.dcInProgress++
        } else if (commandType === 'D1-RemoteDisconnect' && commandStatus === 'DISCARDED') {
          stats.dcFailed++
        }

        // NOCS-wise stats
        if (!nocsMap[nocsName]) {
          nocsMap[nocsName] = {
            nocsName,
            rcSuccess: 0,
            rcInProgress: 0,
            dcSuccess: 0,
            dcInProgress: 0,
            dcFailed: 0,
            total: 0
          }
        }

        nocsMap[nocsName].total++

        if (commandType === 'D1-RemoteConnect' && commandStatus === 'COMPLETED') {
          nocsMap[nocsName].rcSuccess++
        } else if (commandType === 'D1-RemoteConnect' && commandStatus === 'COMINPROG') {
          nocsMap[nocsName].rcInProgress++
        } else if (commandType === 'D1-RemoteDisconnect' && commandStatus === 'COMPLETED') {
          nocsMap[nocsName].dcSuccess++
        } else if (commandType === 'D1-RemoteDisconnect' && commandStatus === 'COMINPROG') {
          nocsMap[nocsName].dcInProgress++
        } else if (commandType === 'D1-RemoteDisconnect' && commandStatus === 'DISCARDED') {
          nocsMap[nocsName].dcFailed++
        }
      })

      // Convert NOCS map to array and sort by total commands (descending)
      const nocsArray = Object.values(nocsMap).sort((a, b) => b.total - a.total)

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
