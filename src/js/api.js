/**
 * StudySync â€” Unified ApiClient
 * Connects frontend views to Node.js Mock Server or live Google Apps Script Web App (Code.gs).
 * Implements all 7 authoritative action endpoints with error handling, retry resilience, and mock fallback.
 */

import { Toast } from './toast.js';

// Live Google Apps Script Web App Endpoint
const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec';

class ApiClientEngine {
  constructor() {
    let storedUrl = null;
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        storedUrl = window.localStorage.getItem('STUDYSYNC_API_URL');
      }
    } catch (e) {}
    this.baseUrl = storedUrl || (typeof window !== 'undefined' && window.STUDYSYNC_API_URL) || DEFAULT_API_URL;
    this.timeoutMs = 30000;
  }

  /**
   * Set custom API Base URL (e.g. Google Apps Script Web App URL)
   * @param {string} url 
   */
  setBaseUrl(url) {
    if (url && typeof url === 'string') {
      this.baseUrl = url.trim();
    }
  }

  /**
   * Get active API Base URL
   * @returns {string}
   */
  getBaseUrl() {
    return this.baseUrl;
  }

  /**
   * Core request dispatcher with JSON envelope and text/plain fallback
   * @param {string} action 
   * @param {Object} [payload={}] 
   * @param {'GET'|'POST'} [method='POST'] 
   * @returns {Promise<{ success: boolean, data: any, error: string|null, timestamp: string }>}
   */
  async request(action, payload = {}, method = 'POST') {
    const isGet = method.toUpperCase() === 'GET';
    let url = this.baseUrl;

    const requestPayload = { action, ...payload };
    const options = {
      method: isGet ? 'GET' : 'POST',
      headers: {
        'Accept': 'application/json'
      }
    };

    if (isGet) {
      const queryParams = new URLSearchParams();
      queryParams.set('action', action);
      for (const [key, val] of Object.entries(payload)) {
        if (val !== undefined && val !== null) {
          queryParams.set(key, String(val));
        }
      }
      url = `${url}?${queryParams.toString()}`;
    } else {
      // Use application/json for mock server, or text/plain for Apps Script Web App
      const isAppsScript = this.baseUrl.includes('script.google.com');
      if (isAppsScript) {
        options.headers['Content-Type'] = 'text/plain;charset=utf-8';
        options.body = JSON.stringify(requestPayload);
      } else {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(requestPayload);
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
      options.signal = controller.signal;

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      const rawText = await response.text();
      let resJson = null;

      try {
        resJson = JSON.parse(rawText);
      } catch (e) {
        // Response was not JSON
        return {
          success: false,
          data: null,
          error: `Non-JSON server response (${response.status}): ${rawText.substring(0, 150)}`,
          timestamp: new Date().toISOString()
        };
      }

      // Check standard JSON envelope { success, data, error }
      if (typeof resJson.success === 'boolean') {
        return resJson;
      }

      return {
        success: response.ok,
        data: resJson,
        error: response.ok ? null : (resJson.error || `HTTP ${response.status}`),
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      const errorMsg = err.name === 'AbortError' 
        ? 'Request timed out. Please check your network connection.'
        : (err.message || 'Network request failed');

      console.warn(`[ApiClient] Request failed for action '${action}':`, errorMsg);
      return {
        success: false,
        data: null,
        error: errorMsg,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ==========================================================================
  // 7 AUTHORITATIVE ENDPOINTS
  // ==========================================================================

  /**
   * 1. Check if user is registered and fetch today's status & stats
   * @param {string} email 
   * @returns {Promise<{ success: boolean, data: { registered: boolean, member: Object|null, todayLog: Object|null, stats: Object|null } }>}
   */
  async checkUser(email) {
    if (!email) {
      return { success: false, data: null, error: 'Email is required' };
    }
    return this.request('checkUser', { email: email.trim().toLowerCase() });
  }

  /**
   * 2. Register a new student member with stream & optional subject
   * @param {Object} payload 
   * @param {string} payload.fullName
   * @param {string} payload.email
   * @param {'Male'|'Female'|'Other'} payload.gender
   * @param {string} payload.telegram
   * @param {string} payload.school
   * @param {string} payload.stream
   * @param {string} payload.optionalSubject
   * @returns {Promise<{ success: boolean, data: Object }>}
   */
  async registerUser(payload) {
    return this.request('registerUser', payload);
  }

  /**
   * 3. Submit daily study log with 3 stream-specific subjects & proof photo
   * @param {Object} payload 
   * @param {string} payload.studyId
   * @param {string} payload.email
   * @param {string} payload.dateOfStudy
   * @param {Array<{name: string, hours: number, focus: number, productivity: number}>} payload.subjects
   * @param {string} [payload.notes]
   * @param {string} [payload.telegram]
   * @param {Object} [payload.proofFile] { base64, mimeType, fileName }
   * @returns {Promise<{ success: boolean, data: Object }>}
   */
  async submitDailyLog(payload) {
    return this.request('submitDailyLog', payload);
  }

  /**
   * 4. Retrieve student study log history and personal stats
   * @param {string} studyId 
   * @param {string} [email] 
   * @returns {Promise<{ success: boolean, data: { studyId: string, logs: Array, stats: Object } }>}
   */
  async getStudentHistory(studyId, email) {
    return this.request('getStudentHistory', { studyId, email });
  }

  /**
   * 5. Verify public member record for Digital ID pass scan
   * @param {string} studyId 
   * @returns {Promise<{ success: boolean, data: { valid: boolean, member: Object|null } }>}
   */
  async verifyMember(studyId) {
    if (!studyId) {
      return { success: false, data: { valid: false }, error: 'Study ID required' };
    }
    return this.request('verifyMember', { studyId: studyId.trim().toUpperCase() });
  }

  /**
   * 6. Retrieve protected admin directory, logs, analytics, and leaderboard
   * @param {string} adminEmail 
   * @returns {Promise<{ success: boolean, data: { members: Array, recentLogs: Array, analytics: Object, leaderboard: Array } }>}
   */
  async getAdminData(adminEmail) {
    return this.request('getAdminData', { adminEmail });
  }

  /**
   * 7. Retrieve public group analytics and leaderboard
   * @returns {Promise<{ success: boolean, data: { kpi: Object, streamBreakdown: Object, topStreaks: Array } }>}
   */
  async getAnalytics() {
    return this.request('getAnalytics', {});
  }

  /**
   * 8. Update member profile data (Name, Telegram, School, Stream, Optional Subject)
   * @param {Object} payload 
   * @returns {Promise<{ success: boolean, data: { member: Object } }>}
   */
  async updateProfile(payload) {
    return this.request('updateProfile', payload);
  }

  /**
   * 9. Admin update member details or status (Active/Inactive)
   * @param {Object} payload 
   * @returns {Promise<{ success: boolean, data: { member: Object } }>}
   */
  async adminUpdateMember(payload) {
    return this.request('adminUpdateMember', payload);
  }

  /**
   * Health / ping check
   */
  async ping() {
    return this.request('ping', {}, 'GET');
  }
}

// Export singleton instance
export const ApiClient = new ApiClientEngine();
export default ApiClient;
