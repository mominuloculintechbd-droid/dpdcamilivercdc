<template>
  <div class="dashboard-container">
    <!-- Top Navigation Bar -->
    <v-app-bar color="white" elevation="2" class="top-bar">
      <div class="max-width-container">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="42" class="mr-3">
              <v-icon size="26">mdi-gauge</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h6 font-weight-bold mb-0 text-primary">Meter-wise Command Report</h2>
              <p class="text-caption text-medium-emphasis mb-0">Detailed Command Tracking</p>
            </div>
          </div>
          <div class="d-flex align-center ga-2">
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              to="/"
            >
              <v-icon start size="small">mdi-view-dashboard</v-icon>
              Dashboard
            </v-btn>
            <v-chip color="success" variant="flat" size="small" class="pulse-chip">
              <v-icon start size="small">mdi-circle</v-icon>
              Live
            </v-chip>
          </div>
        </div>
      </div>
    </v-app-bar>

    <!-- Error Alert -->
    <div v-if="reportsStore.meterDataError" class="alert-container">
      <div class="max-width-container">
        <v-alert
          type="error"
          variant="tonal"
          closable
          class="my-4"
          @click:close="reportsStore.meterDataError = null"
        >
          <v-alert-title class="font-weight-bold">Database Connection Error</v-alert-title>
          <div class="mt-2">
            <p>Unable to connect to the Oracle database. Please check:</p>
            <ul class="ml-4">
              <li>VPN connection is active</li>
              <li>Network connectivity to database server</li>
              <li>Database credentials are correct</li>
            </ul>
            <p class="text-caption mt-2 font-mono">{{ reportsStore.meterDataError }}</p>
          </div>
        </v-alert>
      </div>
    </div>

    <!-- Header Section -->
    <div class="header-section">
      <div class="max-width-container py-8">
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center mb-3">
              <v-avatar color="white" size="56" class="mr-4">
                <v-icon color="primary" size="32">mdi-table-large</v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h3 font-weight-bold text-white mb-1">Meter Commands</h1>
                <p class="text-subtitle-1 text-white text-opacity-90">
                  View and filter meter-wise command data
                </p>
              </div>
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip color="white" variant="flat" size="small">
                <v-icon start size="small">mdi-calendar-today</v-icon>
                Today's Data
              </v-chip>
              <v-chip v-if="reportsStore.meterDataLastUpdated" color="white" variant="flat" size="small">
                <v-icon start size="small">mdi-clock-outline</v-icon>
                {{ formatDateTime(reportsStore.meterDataLastUpdated) }}
              </v-chip>
              <v-chip color="white" variant="flat" size="small">
                <v-icon start size="small">mdi-table-row</v-icon>
                {{ filteredData.length }} Records
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-md-right">
            <v-btn
              color="white"
              size="large"
              :loading="reportsStore.meterDataLoading"
              @click="fetchData"
              elevation="0"
              rounded="pill"
              class="refresh-btn px-6"
              variant="flat"
            >
              <v-icon start class="mr-2">mdi-refresh</v-icon>
              <span class="font-weight-bold">Refresh</span>
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-width-container py-8">
      <!-- Summary Stats Cards -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card" elevation="4" rounded="xl">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">Total Records</p>
                  <h2 class="text-h4 font-weight-bold text-primary">{{ reportsStore.meterData.length }}</h2>
                </div>
                <v-avatar color="primary-lighten-5" size="56" class="stat-avatar">
                  <v-icon color="primary" size="28">mdi-file-document-multiple</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card" elevation="4" rounded="xl">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">Filtered Results</p>
                  <h2 class="text-h4 font-weight-bold text-success">{{ filteredData.length }}</h2>
                </div>
                <v-avatar color="success-lighten-5" size="56" class="stat-avatar">
                  <v-icon color="success" size="28">mdi-filter-check</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card" elevation="4" rounded="xl">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">Active Filters</p>
                  <h2 class="text-h4 font-weight-bold text-warning">{{ activeFilterCount }}</h2>
                </div>
                <v-avatar color="warning-lighten-5" size="56" class="stat-avatar">
                  <v-icon color="warning" size="28">mdi-filter-cog</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stats-card" elevation="4" rounded="xl">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">Last Updated</p>
                  <h2 class="text-caption font-weight-bold text-info">
                    {{ reportsStore.meterDataLastUpdated ? formatTime(reportsStore.meterDataLastUpdated) : 'N/A' }}
                  </h2>
                </div>
                <v-avatar color="info-lighten-5" size="56" class="stat-avatar">
                  <v-icon color="info" size="28">mdi-clock-outline</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filters Card -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card elevation="6" rounded="xl" class="filter-card">
            <div class="filter-card-header pa-6 pb-4">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-avatar color="white" size="48" class="mr-4 filter-icon">
                    <v-icon color="primary" size="26">mdi-filter-variant</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h5 font-weight-bold text-white mb-1">Advanced Filters</h2>
                    <p class="text-caption text-white text-opacity-90 mb-0">Refine your search with multiple criteria</p>
                  </div>
                </div>
                <v-chip
                  v-if="hasActiveFilters"
                  color="white"
                  variant="flat"
                  size="small"
                  class="animate-pulse"
                >
                  <v-icon start size="small">mdi-filter</v-icon>
                  {{ activeFilterCount }} Active
                </v-chip>
              </div>
            </div>
            <v-divider class="border-opacity-25"></v-divider>
            <v-card-text class="pa-6">
              <v-row>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="filters.nocsName"
                    :items="uniqueNocsNames"
                    label="NOCS Name"
                    prepend-inner-icon="mdi-office-building"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="filters.meterNumber"
                    label="Meter Number (MSN)"
                    prepend-inner-icon="mdi-gauge"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="filters.customerId"
                    label="Customer ID"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="filters.commandType"
                    :items="commandTypes"
                    label="Command Type"
                    prepend-inner-icon="mdi-flash"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="filters.commandStatus"
                    :items="commandStatuses"
                    label="Command Status"
                    prepend-inner-icon="mdi-check-circle"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="filters.meterStatus"
                    :items="meterStatuses"
                    label="Meter Status"
                    prepend-inner-icon="mdi-connection"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    hide-details
                  ></v-select>
                </v-col>
              </v-row>
              <v-row class="mt-4">
                <v-col cols="12" class="d-flex justify-end ga-3">
                  <v-btn
                    color="secondary"
                    variant="tonal"
                    size="large"
                    @click="clearFilters"
                    :disabled="!hasActiveFilters"
                    rounded="lg"
                    class="action-btn"
                  >
                    <v-icon start>mdi-filter-remove</v-icon>
                    Clear All Filters
                  </v-btn>
                  <v-btn
                    color="success"
                    variant="flat"
                    size="large"
                    @click="exportToExcel"
                    :disabled="filteredData.length === 0"
                    rounded="lg"
                    class="action-btn download-btn"
                  >
                    <v-icon start>mdi-microsoft-excel</v-icon>
                    Export to Excel
                    <v-chip
                      v-if="filteredData.length > 0"
                      color="white"
                      size="small"
                      class="ml-2"
                    >
                      {{ filteredData.length }}
                    </v-chip>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Data Table -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="6" rounded="xl" class="data-table-card">
            <div class="table-header pa-6 pb-4">
              <div class="d-flex align-center justify-space-between flex-wrap ga-3">
                <div class="d-flex align-center">
                  <v-avatar color="white" size="48" class="mr-4 table-icon">
                    <v-icon color="primary" size="26">mdi-table-large</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h5 font-weight-bold text-white mb-1">Meter Command Records</h2>
                    <p class="text-caption text-white text-opacity-90 mb-0">
                      <v-icon size="small" class="mr-1">mdi-check-circle</v-icon>
                      Displaying {{ filteredData.length }} of {{ reportsStore.meterData.length }} total records
                    </p>
                  </div>
                </div>
                <v-progress-circular
                  v-if="reportsStore.meterDataLoading"
                  indeterminate
                  color="white"
                  size="32"
                  width="3"
                ></v-progress-circular>
              </div>
            </div>
            <v-divider class="border-opacity-25"></v-divider>
            <v-card-text class="pa-0">
              <v-data-table
                :headers="headers"
                :items="filteredData"
                :items-per-page="25"
                :loading="reportsStore.meterDataLoading"
                class="modern-table"
                hover
              >
                <template v-slot:item.COMMAND_TYPE="{ item }">
                  <v-chip
                    :color="item.COMMAND_TYPE?.trim() === 'D1-RemoteConnect' ? 'success' : 'error'"
                    variant="flat"
                    size="small"
                    class="font-weight-bold"
                  >
                    {{ item.COMMAND_TYPE?.trim() === 'D1-RemoteConnect' ? 'RC' : 'DC' }}
                  </v-chip>
                </template>
                <template v-slot:item.COMMAND_STATUS="{ item }">
                  <v-chip
                    :color="getStatusColor(item.COMMAND_STATUS)"
                    variant="flat"
                    size="small"
                    class="font-weight-bold"
                  >
                    {{ getStatusLabel(item.COMMAND_STATUS) }}
                  </v-chip>
                </template>
                <template v-slot:item.METER_STATUS="{ item }">
                  <v-chip
                    :color="getMeterStatusColor(item.COMMAND_TYPE, item.COMMAND_STATUS)"
                    variant="flat"
                    size="small"
                    class="font-weight-bold"
                  >
                    {{ getMeterStatus(item.COMMAND_TYPE, item.COMMAND_STATUS) }}
                  </v-chip>
                </template>
                <template v-slot:item.PAYOFF_BALNCE="{ item }">
                  <span class="font-weight-medium">
                    {{ formatCurrency(item.PAYOFF_BALNCE) }}
                  </span>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" location="top">
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbarColor === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
        <span>{{ snackbarMessage }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReportsStore } from '../stores/reportsStore'
import * as XLSX from 'xlsx'

interface Filters {
  nocsName: string | null
  meterNumber: string
  customerId: string
  commandType: string | null
  commandStatus: string | null
  meterStatus: string | null
}

const reportsStore = useReportsStore()

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const filters = ref<Filters>({
  nocsName: null,
  meterNumber: '',
  customerId: '',
  commandType: null,
  commandStatus: null,
  meterStatus: null
})

const commandTypes = [
  { title: 'Remote Connect', value: 'D1-RemoteConnect' },
  { title: 'Remote Disconnect', value: 'D1-RemoteDisconnect' }
]

const commandStatuses = [
  { title: 'Completed', value: 'COMPLETED' },
  { title: 'In Progress', value: 'COMINPROG' },
  { title: 'Discarded', value: 'DISCARDED' }
]

const meterStatuses = [
  { title: 'Connected', value: 'Connected' },
  { title: 'Disconnected', value: 'Disconnected' },
  { title: 'RC In Progress', value: 'RC In Progress' },
  { title: 'DC In Progress', value: 'DC In Progress' },
  { title: 'Discarded', value: 'Discarded' }
]

const headers = [
  { title: 'NOCS Name', key: 'NOCS_NAME', align: 'start' as const },
  { title: 'Meter Number', key: 'MSN', align: 'start' as const },
  { title: 'Customer ID', key: 'OLD_CONSUMER_ID', align: 'start' as const },
  { title: 'Command Type', key: 'COMMAND_TYPE', align: 'center' as const },
  { title: 'Command Status', key: 'COMMAND_STATUS', align: 'center' as const },
  { title: 'Meter Status', key: 'METER_STATUS', align: 'center' as const },
  { title: 'Trigger Date', key: 'DATE_OF_COMMAND_TRIGGER', align: 'start' as const },
  { title: 'Payoff Balance', key: 'PAYOFF_BALNCE', align: 'end' as const }
]

// Get unique NOCS names for dropdown
const uniqueNocsNames = computed(() => {
  const names = [...new Set(reportsStore.meterData.map(item => item.NOCS_NAME))]
    .filter(name => name)
    .sort()
  return names.map(name => ({ title: name, value: name }))
})

// Get unique command types from actual data (for debugging)
const uniqueCommandTypes = computed(() => {
  const types = [...new Set(reportsStore.meterData.map(item => item.COMMAND_TYPE?.trim()))]
    .filter(type => type)
  console.log('Unique Command Types from data:', types)
  return types
})

// Get unique command statuses from actual data (for debugging)
const uniqueCommandStatuses = computed(() => {
  const statuses = [...new Set(reportsStore.meterData.map(item => item.COMMAND_STATUS?.trim()))]
    .filter(status => status)
  console.log('Unique Command Statuses from data:', statuses)
  return statuses
})

const filteredData = computed(() => {
  let data = [...reportsStore.meterData]

  // Trigger debug computed properties
  uniqueCommandTypes.value
  uniqueCommandStatuses.value

  if (filters.value.nocsName) {
    data = data.filter(item => item.NOCS_NAME === filters.value.nocsName)
  }

  if (filters.value.meterNumber) {
    const search = filters.value.meterNumber.toLowerCase()
    data = data.filter(item => item.MSN?.toLowerCase().includes(search))
  }

  if (filters.value.customerId) {
    const search = filters.value.customerId.toLowerCase()
    data = data.filter(item => item.OLD_CONSUMER_ID?.toLowerCase().includes(search))
  }

  if (filters.value.commandType) {
    console.log('Filtering by Command Type:', filters.value.commandType)
    console.log('Sample data item COMMAND_TYPE:', reportsStore.meterData[0]?.COMMAND_TYPE)
    data = data.filter(item => {
      const trimmed = item.COMMAND_TYPE?.trim()
      const matches = trimmed === filters.value.commandType
      if (!matches && item.COMMAND_TYPE) {
        console.log('Not matching:', `"${item.COMMAND_TYPE}" (length: ${item.COMMAND_TYPE.length})`, 'vs', `"${filters.value.commandType}" (length: ${filters.value.commandType.length})`)
      }
      return matches
    })
    console.log('Filtered data count:', data.length)
  }

  if (filters.value.commandStatus) {
    console.log('Filtering by Command Status:', filters.value.commandStatus)
    data = data.filter(item => {
      const trimmed = item.COMMAND_STATUS?.trim()
      return trimmed === filters.value.commandStatus
    })
    console.log('Filtered data count after status:', data.length)
  }

  if (filters.value.meterStatus) {
    console.log('Filtering by Meter Status:', filters.value.meterStatus)
    data = data.filter(item => {
      const meterStatus = getMeterStatus(item.COMMAND_TYPE, item.COMMAND_STATUS)
      return meterStatus === filters.value.meterStatus
    })
    console.log('Filtered data count after meter status:', data.length)
  }

  return data
})

const hasActiveFilters = computed(() => {
  return filters.value.nocsName !== null ||
    filters.value.meterNumber !== '' ||
    filters.value.customerId !== '' ||
    filters.value.commandType !== null ||
    filters.value.commandStatus !== null ||
    filters.value.meterStatus !== null
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.nocsName) count++
  if (filters.value.meterNumber) count++
  if (filters.value.customerId) count++
  if (filters.value.commandType) count++
  if (filters.value.commandStatus) count++
  if (filters.value.meterStatus) count++
  return count
})

const fetchData = async () => {
  const result = await reportsStore.fetchMeterData()

  snackbarMessage.value = result.message
  snackbarColor.value = result.success ? 'success' : 'error'
  snackbar.value = true
}

const clearFilters = () => {
  filters.value = {
    nocsName: null,
    meterNumber: '',
    customerId: '',
    commandType: null,
    commandStatus: null,
    meterStatus: null
  }
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'COMINPROG':
      return 'warning'
    case 'DISCARDED':
      return 'error'
    default:
      return 'grey'
  }
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'Completed'
    case 'COMINPROG':
      return 'In Progress'
    case 'DISCARDED':
      return 'Discarded'
    default:
      return status
  }
}

const getMeterStatus = (commandType: string, commandStatus: string): string => {
  const type = commandType?.trim()
  const status = commandStatus?.trim()

  // Debug logging
  console.log('getMeterStatus - Type:', `"${type}"`, 'Status:', `"${status}"`)

  // Check if it's a Remote Connect command
  const isRemoteConnect = type === 'D1-RemoteConnect'
  const isRemoteDisconnect = type === 'D1-RemoteDisconnect'

  if (isRemoteConnect && status === 'COMPLETED') {
    return 'Connected'
  } else if (isRemoteDisconnect && status === 'COMPLETED') {
    return 'Disconnected'
  } else if (isRemoteConnect && status === 'COMINPROG') {
    return 'RC In Progress'
  } else if (isRemoteDisconnect && status === 'COMINPROG') {
    return 'DC In Progress'
  } else if (status === 'DISCARDED') {
    return 'Discarded'
  } else {
    // If we can't match, show what we received for debugging
    console.warn('Unknown meter status combination:', { type, status })
    return 'Unknown'
  }
}

const getMeterStatusColor = (commandType: string, commandStatus: string): string => {
  const type = commandType?.trim()
  const status = commandStatus?.trim()

  if (status === 'COMPLETED') {
    return 'success'
  } else if (status === 'COMINPROG') {
    return 'warning'
  } else if (status === 'DISCARDED') {
    return 'error'
  } else {
    return 'grey'
  }
}

const formatCurrency = (value: number): string => {
  if (value == null) return '0.00'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString()
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const exportToExcel = () => {
  try {
    // Prepare data for Excel export
    const excelData = filteredData.value.map(item => ({
      'NOCS Name': item.NOCS_NAME,
      'Meter Number': item.MSN,
      'Customer ID': item.OLD_CONSUMER_ID,
      'Command Type': item.COMMAND_TYPE?.trim() === 'D1-RemoteConnect' ? 'RC' : 'DC',
      'Command Status': getStatusLabel(item.COMMAND_STATUS),
      'Meter Status': getMeterStatus(item.COMMAND_TYPE, item.COMMAND_STATUS),
      'Trigger Date': item.DATE_OF_COMMAND_TRIGGER,
      'Payoff Balance': item.PAYOFF_BALNCE
    }))

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const colWidths = [
      { wch: 25 }, // NOCS Name
      { wch: 18 }, // Meter Number
      { wch: 15 }, // Customer ID
      { wch: 15 }, // Command Type
      { wch: 18 }, // Command Status
      { wch: 18 }, // Meter Status
      { wch: 22 }, // Trigger Date
      { wch: 18 }  // Payoff Balance
    ]
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Meter Commands')

    // Generate filename with current date
    const date = new Date()
    const dateStr = date.toISOString().split('T')[0]
    const filename = `Meter_Commands_${dateStr}.xlsx`

    // Save file
    XLSX.writeFile(wb, filename)

    snackbarMessage.value = `Excel file downloaded successfully (${filteredData.value.length} records)`
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (err) {
    console.error('Error exporting to Excel:', err)
    snackbarMessage.value = 'Failed to export data to Excel'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

onMounted(() => {
  // Only fetch if data is not already loaded
  if (reportsStore.meterData.length === 0) {
    fetchData()
  }
})
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(180deg, #f5f7fa 0%, #e8eef3 50%, #ffffff 100%);
  min-height: 100vh;
  width: 100%;
  padding-top: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.top-bar {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
}

.max-width-container {
  max-width: 1600px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  width: 100%;
  padding-left: 32px !important;
  padding-right: 32px !important;
}

@media (min-width: 1920px) {
  .max-width-container {
    max-width: 1600px !important;
  }
}

@media (max-width: 1919px) {
  .max-width-container {
    max-width: 95% !important;
  }
}

@media (max-width: 960px) {
  .max-width-container {
    max-width: 100% !important;
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
}

.alert-container {
  width: 100%;
  padding-top: 8px;
  display: flex;
  justify-content: center;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
  width: 100%;
  display: flex;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.refresh-btn {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%) !important;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.refresh-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2) !important;
  border-color: rgba(255, 255, 255, 1) !important;
}

.refresh-btn span {
  color: #667eea !important;
}

.pulse-chip {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.8);
  }
}

/* Stats Cards */
.stats-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  overflow: hidden;
  position: relative;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12) !important;
  border-color: rgba(102, 126, 234, 0.3);
}

.stats-card:hover::before {
  transform: scaleX(1);
}

.stat-avatar {
  transition: all 0.3s ease;
}

.stats-card:hover .stat-avatar {
  transform: scale(1.1) rotate(5deg);
}

/* Filter Card */
.filter-card {
  overflow: hidden;
  border: 2px solid transparent;
  background: #ffffff;
  transition: all 0.3s ease;
}

.filter-card:hover {
  border-color: rgba(102, 126, 234, 0.2);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15) !important;
}

.filter-card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.filter-card-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

.filter-icon {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.filter-card:hover .filter-icon {
  transform: rotate(360deg);
}

.animate-pulse {
  animation: pulse-filter 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-filter {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Action Buttons */
.action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.download-btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%) !important;
}

.download-btn:hover {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%) !important;
}

/* Data Table Card */
.data-table-card {
  overflow: hidden;
  border: 2px solid transparent;
  background: #ffffff;
  transition: all 0.3s ease;
}

.data-table-card:hover {
  border-color: rgba(102, 126, 234, 0.2);
}

.table-header {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  position: relative;
}

.table-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

.table-icon {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: rotate-slow 10s linear infinite;
}

@keyframes rotate-slow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Table Styling */
.modern-table :deep(thead) {
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
}

.modern-table :deep(th) {
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 1px;
  color: #495057 !important;
  padding: 16px !important;
  border-bottom: 2px solid #dee2e6 !important;
}

.modern-table :deep(tbody tr) {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f3f5;
}

.modern-table :deep(tbody tr:hover) {
  background: linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%) !important;
  transform: scale(1.002);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.modern-table :deep(td) {
  padding: 16px !important;
}

/* Chip Enhancements */
.modern-table :deep(.v-chip) {
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.modern-table :deep(.v-chip:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Color Classes */
.primary-lighten-5 {
  background-color: rgba(25, 118, 210, 0.1) !important;
}

.success-lighten-5 {
  background-color: rgba(76, 175, 80, 0.1) !important;
}

.warning-lighten-5 {
  background-color: rgba(255, 152, 0, 0.1) !important;
}

.info-lighten-5 {
  background-color: rgba(3, 169, 244, 0.1) !important;
}

/* Loading State */
.v-data-table :deep(.v-data-table-progress) {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

/* Scrollbar Styling */
.data-table-card :deep(.v-table__wrapper)::-webkit-scrollbar {
  height: 8px;
}

.data-table-card :deep(.v-table__wrapper)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.data-table-card :deep(.v-table__wrapper)::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

.data-table-card :deep(.v-table__wrapper)::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}
</style>
