import toast from 'react-hot-toast';
import websocketService from './websocket';

class NotificationManager {
  constructor() {
    this.permission = 'default';
    this.completedJobs = new Set();
    this.lastViewedTimestamp = this.getLastViewedTimestamp();
  }

  /**
   * Initialize notification system
   */
  async initialize() {
    // Request browser notification permission
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }

    // Connect WebSocket
    websocketService.connect();

    // Listen for job events
    websocketService.on('job:event', (data) => {
      this.handleJobEvent(data);
    });
  }

  /**
   * Handle job events from WebSocket
   */
  handleJobEvent(data) {
    const { jobId, event, reportName, rowCount, executionTime, error } = data;

    switch (event) {
      case 'started':
        this.showToast(`Report "${reportName}" started`, 'loading');
        break;

      case 'completed':
        this.completedJobs.add(jobId);
        this.saveCompletedJobs();

        const successMessage = `Report "${reportName}" completed (${rowCount} rows, ${executionTime}ms)`;
        this.showToast(successMessage, 'success');
        this.showBrowserNotification('Report Completed', successMessage);

        // Update badge count
        this.updateBadgeCount();
        break;

      case 'failed':
        this.showToast(`Report "${reportName}" failed: ${error}`, 'error');
        this.showBrowserNotification('Report Failed', `Report "${reportName}" failed`);
        break;

      case 'cancelled':
        this.showToast(`Report "${reportName}" cancelled`, 'info');
        break;

      default:
        break;
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    switch (type) {
      case 'success':
        toast.success(message, {
          duration: 5000,
          position: 'bottom-right'
        });
        break;
      case 'error':
        toast.error(message, {
          duration: 7000,
          position: 'bottom-right'
        });
        break;
      case 'loading':
        toast.loading(message, {
          duration: 3000,
          position: 'bottom-right'
        });
        break;
      case 'info':
      default:
        toast(message, {
          duration: 4000,
          position: 'bottom-right'
        });
        break;
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(title, body) {
    if (this.permission === 'granted' && 'Notification' in window) {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }

  /**
   * Get count of unviewed completed jobs
   */
  getUnviewedCount() {
    const completedJobs = Array.from(this.completedJobs);
    // Count jobs completed after last viewed timestamp
    return completedJobs.filter(jobId => {
      // This is simplified - ideally we'd store completion timestamps
      return true;
    }).length;
  }

  /**
   * Mark all completed jobs as viewed
   */
  markAllViewed() {
    this.lastViewedTimestamp = Date.now();
    localStorage.setItem('queryHistoryLastViewed', this.lastViewedTimestamp.toString());
    this.updateBadgeCount();
  }

  /**
   * Get last viewed timestamp from localStorage
   */
  getLastViewedTimestamp() {
    const stored = localStorage.getItem('queryHistoryLastViewed');
    return stored ? parseInt(stored, 10) : Date.now();
  }

  /**
   * Save completed jobs to localStorage
   */
  saveCompletedJobs() {
    const jobs = Array.from(this.completedJobs);
    localStorage.setItem('completedJobs', JSON.stringify(jobs));
  }

  /**
   * Load completed jobs from localStorage
   */
  loadCompletedJobs() {
    const stored = localStorage.getItem('completedJobs');
    if (stored) {
      try {
        const jobs = JSON.parse(stored);
        this.completedJobs = new Set(jobs);
      } catch (error) {
        console.error('Failed to load completed jobs:', error);
      }
    }
  }

  /**
   * Update badge count (will be called by React components)
   */
  updateBadgeCount() {
    // This will trigger a re-render in components listening to this
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('badgeCountUpdated'));
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    websocketService.disconnect();
  }
}

// Export singleton instance
const notificationManager = new NotificationManager();
export default notificationManager;
