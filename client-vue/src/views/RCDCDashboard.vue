<template>
  <div class="dashboard-container">
    <!-- Top Navigation Bar -->
    <v-app-bar color="white" elevation="2" class="top-bar">
      <div class="max-width-container">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="42" class="mr-3">
              <v-icon size="26">mdi-flash</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h6 font-weight-bold mb-0 text-primary">DPDC Live RC/DC Statistics</h2>
              <p class="text-caption text-medium-emphasis mb-0">Real-time Monitoring Dashboard</p>
            </div>
          </div>
          <div class="d-flex align-center ga-2">
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              to="/meter-wise"
            >
              <v-icon start size="small">mdi-gauge</v-icon>
              Meter-wise Report
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
    <div v-if="reportsStore.analyticsError" class="alert-container">
      <div class="max-width-container">
        <v-alert
          type="error"
          variant="tonal"
          closable
          class="my-4"
          @click:close="reportsStore.analyticsError = null"
        >
          <v-alert-title class="font-weight-bold">Database Connection Error</v-alert-title>
          <div class="mt-2">
            <p>Unable to connect to the Oracle database. Please check:</p>
            <ul class="ml-4">
              <li>VPN connection is active</li>
              <li>Network connectivity to database server</li>
              <li>Database credentials are correct</li>
            </ul>
            <p class="text-caption mt-2 font-mono">{{ reportsStore.analyticsError }}</p>
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
                <v-icon color="primary" size="32">mdi-chart-timeline-variant</v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h3 font-weight-bold text-white mb-1">Dashboard Overview</h1>
                <p class="text-subtitle-1 text-white text-opacity-90">
                  Remote Connect/Disconnect Command Statistics
                </p>
              </div>
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip color="white" variant="flat" size="small">
                <v-icon start size="small">mdi-calendar-today</v-icon>
                Today's Data
              </v-chip>
              <v-chip v-if="reportsStore.analytics.lastUpdated" color="white" variant="flat" size="small">
                <v-icon start size="small">mdi-clock-outline</v-icon>
                {{ formatDateTime(reportsStore.analytics.lastUpdated) }}
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-md-right">
            <div class="d-flex flex-wrap ga-2 justify-end">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    color="white"
                    size="large"
                    elevation="0"
                    rounded="pill"
                    class="download-header-btn px-6"
                    variant="flat"
                    v-bind="props"
                  >
                    <v-icon start class="mr-2">mdi-download</v-icon>
                    <span class="font-weight-bold">Download</span>
                    <v-icon end class="ml-2">mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="exportFullReportToExcel">
                    <template v-slot:prepend>
                      <v-icon color="success">mdi-microsoft-excel</v-icon>
                    </template>
                    <v-list-item-title>Excel Report</v-list-item-title>
                    <v-list-item-subtitle>Complete statistics with summary</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item @click="exportToPDF">
                    <template v-slot:prepend>
                      <v-icon color="error">mdi-file-pdf-box</v-icon>
                    </template>
                    <v-list-item-title>PDF Report</v-list-item-title>
                    <v-list-item-subtitle>Formatted report with tables</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-btn
                color="white"
                size="large"
                :loading="reportsStore.analyticsLoading"
                @click="fetchData"
                elevation="0"
                rounded="pill"
                class="refresh-btn px-6"
                variant="flat"
              >
                <v-icon start class="mr-2">mdi-refresh</v-icon>
                <span class="font-weight-bold">Refresh</span>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-width-container py-8">

      <!-- Overview Stats Cards -->
      <v-row class="mb-4">
        <!-- Total Commands Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="3" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex align-center mb-3">
                <v-avatar color="deep-purple-lighten-5" size="48">
                  <v-icon color="deep-purple" size="24">mdi-chart-bar</v-icon>
                </v-avatar>
                <div class="ml-3">
                  <p class="text-caption text-medium-emphasis mb-0">Total Commands</p>
                  <h2 class="text-h4 font-weight-bold">{{ reportsStore.analytics.totalCommands }}</h2>
                </div>
              </div>
              <v-progress-linear color="deep-purple" :model-value="100" height="4" rounded></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- RC Success Rate Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="3" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex align-center mb-3">
                <v-avatar color="green-lighten-5" size="48">
                  <v-icon color="green" size="24">mdi-power-plug</v-icon>
                </v-avatar>
                <div class="ml-3">
                  <p class="text-caption text-medium-emphasis mb-0">RC Success Rate</p>
                  <h2 class="text-h4 font-weight-bold text-green">
                    {{ calculateSuccessRate(reportsStore.analytics.rcSuccess, reportsStore.analytics.rcSuccess + reportsStore.analytics.rcInProgress) }}%
                  </h2>
                </div>
              </div>
              <v-progress-linear
                color="green"
                :model-value="parseFloat(calculateSuccessRate(reportsStore.analytics.rcSuccess, reportsStore.analytics.rcSuccess + reportsStore.analytics.rcInProgress))"
                height="4"
                rounded
              ></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- DC Success Rate Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="3" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex align-center mb-3">
                <v-avatar color="blue-lighten-5" size="48">
                  <v-icon color="blue" size="24">mdi-power-plug-off</v-icon>
                </v-avatar>
                <div class="ml-3">
                  <p class="text-caption text-medium-emphasis mb-0">DC Success Rate</p>
                  <h2 class="text-h4 font-weight-bold text-blue">
                    {{ calculateSuccessRate(reportsStore.analytics.dcSuccess, reportsStore.analytics.dcSuccess + reportsStore.analytics.dcInProgress + reportsStore.analytics.dcFailed) }}%
                  </h2>
                </div>
              </div>
              <v-progress-linear
                color="blue"
                :model-value="parseFloat(calculateSuccessRate(reportsStore.analytics.dcSuccess, reportsStore.analytics.dcSuccess + reportsStore.analytics.dcInProgress + reportsStore.analytics.dcFailed))"
                height="4"
                rounded
              ></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Overall Success Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="3" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex align-center mb-3">
                <v-avatar color="orange-lighten-5" size="48">
                  <v-icon color="orange" size="24">mdi-check-all</v-icon>
                </v-avatar>
                <div class="ml-3">
                  <p class="text-caption text-medium-emphasis mb-0">Overall Success</p>
                  <h2 class="text-h4 font-weight-bold text-orange">
                    {{ calculateSuccessRate(reportsStore.analytics.rcSuccess + reportsStore.analytics.dcSuccess, reportsStore.analytics.totalCommands) }}%
                  </h2>
                </div>
              </div>
              <v-progress-linear
                color="orange"
                :model-value="parseFloat(calculateSuccessRate(reportsStore.analytics.rcSuccess + reportsStore.analytics.dcSuccess, reportsStore.analytics.totalCommands))"
                height="4"
                rounded
              ></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Remote Connect Section -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="section-header mb-4">
            <v-icon color="primary" size="32" class="mr-2">mdi-power-plug</v-icon>
            <h2 class="text-h5 font-weight-bold">Remote Connect Commands</h2>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="modern-card" elevation="2" rounded="lg">
            <v-card-text class="pa-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="success" size="20" class="mr-2">mdi-check-circle</v-icon>
                    <span class="text-overline font-weight-bold">Completed</span>
                  </div>
                  <h1 class="text-h2 font-weight-bold text-success">{{ reportsStore.analytics.rcSuccess }}</h1>
                  <p class="text-caption text-medium-emphasis mt-1">Successfully connected</p>
                </div>
                <v-avatar color="success-lighten-4" size="80">
                  <v-icon color="success" size="40">mdi-check-circle-outline</v-icon>
                </v-avatar>
              </div>
              <v-divider class="my-3"></v-divider>
              <div class="text-caption text-medium-emphasis">
                <v-icon size="16" class="mr-1">mdi-trending-up</v-icon>
                {{ reportsStore.analytics.rcSuccess }} of {{ reportsStore.analytics.rcSuccess + reportsStore.analytics.rcInProgress }} total
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="modern-card" elevation="2" rounded="lg">
            <v-card-text class="pa-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="warning" size="20" class="mr-2">mdi-clock-outline</v-icon>
                    <span class="text-overline font-weight-bold">In Progress</span>
                  </div>
                  <h1 class="text-h2 font-weight-bold text-warning">{{ reportsStore.analytics.rcInProgress }}</h1>
                  <p class="text-caption text-medium-emphasis mt-1">Currently processing</p>
                </div>
                <v-avatar color="warning-lighten-4" size="80">
                  <v-icon color="warning" size="40">mdi-sync</v-icon>
                </v-avatar>
              </div>
              <v-divider class="my-3"></v-divider>
              <div class="text-caption text-medium-emphasis">
                <v-icon size="16" class="mr-1">mdi-timer-sand</v-icon>
                Pending completion
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Remote Disconnect Section -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="section-header mb-4">
            <v-icon color="error" size="32" class="mr-2">mdi-power-plug-off</v-icon>
            <h2 class="text-h5 font-weight-bold">Remote Disconnect Commands</h2>
          </div>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="modern-card" elevation="2" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="success" size="18" class="mr-1">mdi-check-circle</v-icon>
                    <span class="text-caption font-weight-bold">COMPLETED</span>
                  </div>
                  <h1 class="text-h3 font-weight-bold text-success">{{ reportsStore.analytics.dcSuccess }}</h1>
                </div>
                <v-avatar color="success-lighten-4" size="56">
                  <v-icon color="success" size="28">mdi-check</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="modern-card" elevation="2" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="warning" size="18" class="mr-1">mdi-clock-outline</v-icon>
                    <span class="text-caption font-weight-bold">IN PROGRESS</span>
                  </div>
                  <h1 class="text-h3 font-weight-bold text-warning">{{ reportsStore.analytics.dcInProgress }}</h1>
                </div>
                <v-avatar color="warning-lighten-4" size="56">
                  <v-icon color="warning" size="28">mdi-sync</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="modern-card" elevation="2" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon color="error" size="18" class="mr-1">mdi-close-circle</v-icon>
                    <span class="text-caption font-weight-bold">FAILED</span>
                  </div>
                  <h1 class="text-h3 font-weight-bold text-error">{{ reportsStore.analytics.dcFailed }}</h1>
                </div>
                <v-avatar color="error-lighten-4" size="56">
                  <v-icon color="error" size="28">mdi-close</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- NOCS-wise Report Table -->
      <v-row v-if="reportsStore.nocsData.length > 0" class="mb-6">
        <v-col cols="12">
          <v-card elevation="3" rounded="lg" class="modern-card">
            <v-card-title class="pa-6 pb-4">
              <div class="d-flex align-center justify-space-between" style="width: 100%;">
                <div class="d-flex align-center">
                  <v-avatar color="primary-lighten-5" size="40" class="mr-3">
                    <v-icon color="primary" size="24">mdi-map-marker-multiple</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h5 font-weight-bold">NOCS-wise Breakdown</h2>
                    <p class="text-caption text-medium-emphasis mb-0">Detailed statistics by location</p>
                  </div>
                </div>
                <v-btn
                  color="primary"
                  variant="flat"
                  size="default"
                  @click="exportToExcel"
                  :disabled="reportsStore.nocsData.length === 0"
                  rounded="lg"
                  class="download-btn"
                >
                  <v-icon start>mdi-download</v-icon>
                  Download Excel
                </v-btn>
              </div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table
                :headers="headers"
                :items="reportsStore.nocsData"
                :items-per-page="10"
                class="modern-table"
                hover
              >
                <template v-slot:item.nocsName="{ item }">
                  <div class="py-2">
                    <div class="font-weight-medium">{{ item.nocsName }}</div>
                    <div class="text-caption text-medium-emphasis">Total: {{ item.total }}</div>
                  </div>
                </template>
                <template v-slot:item.rcSuccess="{ item }">
                  <v-chip color="success" variant="flat" size="small" class="font-weight-bold">
                    {{ item.rcSuccess }}
                  </v-chip>
                </template>
                <template v-slot:item.rcSuccessPercent="{ item }">
                  <div class="text-center">
                    <div class="font-weight-bold text-success">
                      {{ calculateSuccessRate(item.rcSuccess, item.rcSuccess + item.rcInProgress) }}%
                    </div>
                    <v-progress-linear
                      :model-value="parseFloat(calculateSuccessRate(item.rcSuccess, item.rcSuccess + item.rcInProgress))"
                      color="success"
                      height="3"
                      rounded
                      class="mt-1"
                    ></v-progress-linear>
                  </div>
                </template>
                <template v-slot:item.rcInProgress="{ item }">
                  <v-chip color="warning" variant="flat" size="small" class="font-weight-bold">
                    {{ item.rcInProgress }}
                  </v-chip>
                </template>
                <template v-slot:item.rcInProgressPercent="{ item }">
                  <div class="text-center">
                    <div class="font-weight-bold text-warning">
                      {{ calculateSuccessRate(item.rcInProgress, item.rcSuccess + item.rcInProgress) }}%
                    </div>
                    <v-progress-linear
                      :model-value="parseFloat(calculateSuccessRate(item.rcInProgress, item.rcSuccess + item.rcInProgress))"
                      color="warning"
                      height="3"
                      rounded
                      class="mt-1"
                    ></v-progress-linear>
                  </div>
                </template>
                <template v-slot:item.dcSuccess="{ item }">
                  <v-chip color="success" variant="flat" size="small" class="font-weight-bold">
                    {{ item.dcSuccess }}
                  </v-chip>
                </template>
                <template v-slot:item.dcInProgress="{ item }">
                  <v-chip color="warning" variant="flat" size="small" class="font-weight-bold">
                    {{ item.dcInProgress }}
                  </v-chip>
                </template>
                <template v-slot:item.dcFailed="{ item }">
                  <v-chip color="error" variant="flat" size="small" class="font-weight-bold">
                    {{ item.dcFailed }}
                  </v-chip>
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
import { ref, onMounted } from 'vue'
import { useReportsStore } from '../stores/reportsStore'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const reportsStore = useReportsStore()

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const headers = [
  { title: 'NOCS Name', key: 'nocsName', align: 'start' as const },
  { title: 'RC Success', key: 'rcSuccess', align: 'center' as const },
  { title: 'RC Success %', key: 'rcSuccessPercent', align: 'center' as const },
  { title: 'RC In Progress', key: 'rcInProgress', align: 'center' as const },
  { title: 'RC In Progress %', key: 'rcInProgressPercent', align: 'center' as const },
  { title: 'DC Success', key: 'dcSuccess', align: 'center' as const },
  { title: 'DC In Progress', key: 'dcInProgress', align: 'center' as const },
  { title: 'DC Failed', key: 'dcFailed', align: 'center' as const },
]

const fetchData = async () => {
  const result = await reportsStore.fetchAnalytics()

  snackbarMessage.value = result.message
  snackbarColor.value = result.success ? 'success' : 'error'
  snackbar.value = true
}

const calculateSuccessRate = (success: number, total: number): string => {
  if (total === 0) return '0.0'
  return ((success / total) * 100).toFixed(1)
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString()
}

const exportToExcel = () => {
  try {
    // Prepare data for Excel export
    const excelData = reportsStore.nocsData.map(item => ({
      'NOCS Name': item.nocsName,
      'RC Success': item.rcSuccess,
      'RC Success %': calculateSuccessRate(item.rcSuccess, item.rcSuccess + item.rcInProgress),
      'RC In Progress': item.rcInProgress,
      'RC In Progress %': calculateSuccessRate(item.rcInProgress, item.rcSuccess + item.rcInProgress),
      'DC Success': item.dcSuccess,
      'DC In Progress': item.dcInProgress,
      'DC Failed': item.dcFailed
    }))

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const colWidths = [
      { wch: 25 }, // NOCS Name
      { wch: 12 }, // RC Success
      { wch: 15 }, // RC Success %
      { wch: 15 }, // RC In Progress
      { wch: 18 }, // RC In Progress %
      { wch: 12 }, // DC Success
      { wch: 15 }, // DC In Progress
      { wch: 12 }  // DC Failed
    ]
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'NOCS-wise Breakdown')

    // Generate filename with current date
    const date = new Date()
    const dateStr = date.toISOString().split('T')[0]
    const filename = `NOCS_Breakdown_${dateStr}.xlsx`

    // Save file
    XLSX.writeFile(wb, filename)

    snackbarMessage.value = 'Excel file downloaded successfully'
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (err) {
    console.error('Error exporting to Excel:', err)
    snackbarMessage.value = 'Failed to export data to Excel'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const exportFullReportToExcel = () => {
  try {
    const wb = XLSX.utils.book_new()
    const date = new Date()
    const dateStr = date.toISOString().split('T')[0]
    const timeStr = date.toLocaleString()

    // Summary Sheet
    const summaryData = [
      ['DPDC RC/DC Command Statistics Report'],
      ['Generated:', timeStr],
      [''],
      ['Overall Statistics'],
      ['Metric', 'Value'],
      ['Total Commands', reportsStore.analytics.totalCommands],
      ['RC Success', reportsStore.analytics.rcSuccess],
      ['RC In Progress', reportsStore.analytics.rcInProgress],
      ['RC Success Rate', calculateSuccessRate(reportsStore.analytics.rcSuccess, reportsStore.analytics.rcSuccess + reportsStore.analytics.rcInProgress) + '%'],
      ['DC Success', reportsStore.analytics.dcSuccess],
      ['DC In Progress', reportsStore.analytics.dcInProgress],
      ['DC Failed', reportsStore.analytics.dcFailed],
      ['DC Success Rate', calculateSuccessRate(reportsStore.analytics.dcSuccess, reportsStore.analytics.dcSuccess + reportsStore.analytics.dcInProgress + reportsStore.analytics.dcFailed) + '%'],
      ['Overall Success Rate', calculateSuccessRate(reportsStore.analytics.rcSuccess + reportsStore.analytics.dcSuccess, reportsStore.analytics.totalCommands) + '%']
    ]

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    // NOCS-wise Breakdown Sheet
    const nocsData = reportsStore.nocsData.map(item => ({
      'NOCS Name': item.nocsName,
      'RC Success': item.rcSuccess,
      'RC Success %': calculateSuccessRate(item.rcSuccess, item.rcSuccess + item.rcInProgress),
      'RC In Progress': item.rcInProgress,
      'RC In Progress %': calculateSuccessRate(item.rcInProgress, item.rcSuccess + item.rcInProgress),
      'DC Success': item.dcSuccess,
      'DC In Progress': item.dcInProgress,
      'DC Failed': item.dcFailed
    }))

    const wsNocs = XLSX.utils.json_to_sheet(nocsData)
    wsNocs['!cols'] = [
      { wch: 25 }, { wch: 12 }, { wch: 15 },
      { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 12 }
    ]
    XLSX.utils.book_append_sheet(wb, wsNocs, 'NOCS Breakdown')

    // Save file
    const filename = `RC_DC_Statistics_Report_${dateStr}.xlsx`
    XLSX.writeFile(wb, filename)

    snackbarMessage.value = 'Complete Excel report downloaded successfully'
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (err) {
    console.error('Error exporting full report to Excel:', err)
    snackbarMessage.value = 'Failed to export full report to Excel'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const exportToPDF = () => {
  try {
    const doc = new jsPDF()
    const date = new Date()
    const dateStr = date.toLocaleDateString()
    const timeStr = date.toLocaleTimeString()

    // Title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('DPDC RC/DC Command Statistics', 14, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${dateStr} ${timeStr}`, 14, 28)

    // Summary Statistics
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Overall Statistics', 14, 40)

    const summaryData = [
      ['Total Commands', reportsStore.analytics.totalCommands.toString()],
      ['', ''],
      ['RC Success', reportsStore.analytics.rcSuccess.toString()],
      ['RC In Progress', reportsStore.analytics.rcInProgress.toString()],
      ['RC Success Rate', calculateSuccessRate(reportsStore.analytics.rcSuccess, reportsStore.analytics.rcSuccess + reportsStore.analytics.rcInProgress) + '%'],
      ['', ''],
      ['DC Success', reportsStore.analytics.dcSuccess.toString()],
      ['DC In Progress', reportsStore.analytics.dcInProgress.toString()],
      ['DC Failed', reportsStore.analytics.dcFailed.toString()],
      ['DC Success Rate', calculateSuccessRate(reportsStore.analytics.dcSuccess, reportsStore.analytics.dcSuccess + reportsStore.analytics.dcInProgress + reportsStore.analytics.dcFailed) + '%'],
      ['', ''],
      ['Overall Success Rate', calculateSuccessRate(reportsStore.analytics.rcSuccess + reportsStore.analytics.dcSuccess, reportsStore.analytics.totalCommands) + '%']
    ]

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234], fontStyle: 'bold' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 40, halign: 'right' }
      }
    })

    // NOCS-wise Breakdown
    const finalY = (doc as any).lastAutoTable.finalY || 45
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('NOCS-wise Breakdown', 14, finalY + 15)

    const nocsTableData = reportsStore.nocsData.map(item => [
      item.nocsName,
      item.rcSuccess.toString(),
      calculateSuccessRate(item.rcSuccess, item.rcSuccess + item.rcInProgress) + '%',
      item.rcInProgress.toString(),
      item.dcSuccess.toString(),
      item.dcInProgress.toString(),
      item.dcFailed.toString()
    ])

    autoTable(doc, {
      startY: finalY + 20,
      head: [['NOCS', 'RC Success', 'RC %', 'RC Progress', 'DC Success', 'DC Progress', 'DC Failed']],
      body: nocsTableData,
      theme: 'striped',
      headStyles: { fillColor: [102, 126, 234], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 22, halign: 'center' },
        6: { cellWidth: 20, halign: 'center' }
      }
    })

    // Save PDF
    const filename = `RC_DC_Statistics_Report_${date.toISOString().split('T')[0]}.pdf`
    doc.save(filename)

    snackbarMessage.value = 'PDF report downloaded successfully'
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (err) {
    console.error('Error exporting to PDF:', err)
    snackbarMessage.value = 'Failed to export PDF report'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

onMounted(() => {
  // Only fetch if data is not already loaded
  if (reportsStore.nocsData.length === 0) {
    fetchData()
  }
})
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  min-height: 100vh;
  width: 100%;
  padding-top: 64px; /* Height of the top app bar */
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
}

.refresh-btn,
.download-header-btn {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%) !important;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s ease !important;
}

.refresh-btn:hover,
.download-header-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2) !important;
  border-color: rgba(255, 255, 255, 1) !important;
}

.refresh-btn span,
.download-header-btn span {
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

.stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.modern-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.modern-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}

.section-header {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 3px solid #e0e0e0;
}

.modern-table :deep(thead) {
  background: linear-gradient(to bottom, #f8f9fa, #f1f3f5);
}

.modern-table :deep(th) {
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #495057 !important;
}

.modern-table :deep(tbody tr) {
  transition: background-color 0.2s ease;
}

.modern-table :deep(tbody tr:hover) {
  background-color: #f8f9fa !important;
}

.success-lighten-4 {
  background-color: rgba(76, 175, 80, 0.1) !important;
}

.warning-lighten-4 {
  background-color: rgba(251, 140, 0, 0.1) !important;
}

.error-lighten-4 {
  background-color: rgba(244, 67, 54, 0.1) !important;
}

.primary-lighten-5 {
  background-color: rgba(25, 118, 210, 0.1) !important;
}

.download-btn {
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
