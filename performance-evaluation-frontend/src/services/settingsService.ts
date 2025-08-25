import { api } from './api';
import {
  SystemSettings,
  UserPreferences,
  SystemHealth,
  SettingsResponse,
  UserPreferencesResponse,
  SystemHealthResponse,
  SettingsUpdateRequest,
  UserPreferencesUpdateRequest,
} from '../types/settings';

// ============================================================================
// SYSTEM SETTINGS SERVICE
// ============================================================================

export class SettingsService {
  // ============================================================================
  // SYSTEM SETTINGS MANAGEMENT
  // ============================================================================

  /**
   * Get all system settings
   */
  static async getSystemSettings(): Promise<SystemSettings> {
    try {
      const response = await api.get<SettingsResponse>('/settings/system');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw new Error('Failed to fetch system settings');
    }
  }

  /**
   * Update system settings
   */
  static async updateSystemSettings(
    category: keyof SystemSettings,
    settings: Partial<SystemSettings>
  ): Promise<SystemSettings> {
    try {
      const request: SettingsUpdateRequest = {
        category,
        settings,
      };
      
      const response = await api.put<SettingsResponse>('/settings/system', request);
      return response.data.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw new Error('Failed to update system settings');
    }
  }

  /**
   * Get specific system settings category
   */
  static async getSystemSettingsCategory<T extends keyof SystemSettings>(
    category: T
  ): Promise<SystemSettings[T]> {
    try {
      const response = await api.get<SettingsResponse>(`/settings/system/${category}`);
      return response.data.data[category];
    } catch (error) {
      console.error(`Error fetching ${category} settings:`, error);
      throw new Error(`Failed to fetch ${category} settings`);
    }
  }

  /**
   * Update specific system settings category
   */
  static async updateSystemSettingsCategory<T extends keyof SystemSettings>(
    category: T,
    settings: Partial<SystemSettings[T]>
  ): Promise<SystemSettings[T]> {
    try {
      const response = await api.put<SettingsResponse>(`/settings/system/${category}`, settings);
      return response.data.data[category];
    } catch (error) {
      console.error(`Error updating ${category} settings:`, error);
      throw new Error(`Failed to update ${category} settings`);
    }
  }

  // ============================================================================
  // USER PREFERENCES MANAGEMENT
  // ============================================================================

  /**
   * Get user preferences
   */
  static async getUserPreferences(): Promise<UserPreferences> {
    try {
      const response = await api.get<UserPreferencesResponse>('/settings/user');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw new Error('Failed to fetch user preferences');
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    category: keyof UserPreferences,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      const request: UserPreferencesUpdateRequest = {
        category,
        preferences,
      };
      
      const response = await api.put<UserPreferencesResponse>('/settings/user', request);
      return response.data.data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw new Error('Failed to update user preferences');
    }
  }

  /**
   * Get specific user preferences category
   */
  static async getUserPreferencesCategory<T extends keyof UserPreferences>(
    category: T
  ): Promise<UserPreferences[T]> {
    try {
      const response = await api.get<UserPreferencesResponse>(`/settings/user/${category}`);
      return response.data.data[category];
    } catch (error) {
      console.error(`Error fetching ${category} preferences:`, error);
      throw new Error(`Failed to fetch ${category} preferences`);
    }
  }

  /**
   * Update specific user preferences category
   */
  static async updateUserPreferencesCategory<T extends keyof UserPreferences>(
    category: T,
    preferences: Partial<UserPreferences[T]>
  ): Promise<UserPreferences[T]> {
    try {
      const response = await api.put<UserPreferencesResponse>(`/settings/user/${category}`, preferences);
      return response.data.data[category];
    } catch (error) {
      console.error(`Error updating ${category} preferences:`, error);
      throw new Error(`Failed to update ${category} preferences`);
    }
  }

  // ============================================================================
  // SYSTEM HEALTH & MONITORING
  // ============================================================================

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await api.get<SystemHealthResponse>('/system/health');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw new Error('Failed to fetch system health');
    }
  }

  /**
   * Get system statistics
   */
  static async getSystemStats(): Promise<any> {
    try {
      const response = await api.get('/system/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw new Error('Failed to fetch system stats');
    }
  }

  /**
   * Get system logs (Admin only)
   */
  static async getSystemLogs(level?: string, limit?: number): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (level) params.append('level', level);
      if (limit) params.append('limit', limit.toString());
      
      const response = await api.get(`/system/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching system logs:', error);
      throw new Error('Failed to fetch system logs');
    }
  }

  // ============================================================================
  // ORGANIZATION STRUCTURE SETTINGS
  // ============================================================================

  /**
   * Get department configuration
   */
  static async getDepartmentSettings(): Promise<any[]> {
    try {
      const response = await api.get('/settings/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching department settings:', error);
      throw new Error('Failed to fetch department settings');
    }
  }

  /**
   * Update department settings
   */
  static async updateDepartmentSettings(departments: any[]): Promise<any[]> {
    try {
      const response = await api.put('/settings/departments', { departments });
      return response.data;
    } catch (error) {
      console.error('Error updating department settings:', error);
      throw new Error('Failed to update department settings');
    }
  }

  /**
   * Get role and permission configuration
   */
  static async getRoleSettings(): Promise<any[]> {
    try {
      const response = await api.get('/settings/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching role settings:', error);
      throw new Error('Failed to fetch role settings');
    }
  }

  /**
   * Update role settings
   */
  static async updateRoleSettings(roles: any[]): Promise<any[]> {
    try {
      const response = await api.put('/settings/roles', { roles });
      return response.data;
    } catch (error) {
      console.error('Error updating role settings:', error);
      throw new Error('Failed to update role settings');
    }
  }

  // ============================================================================
  // EVALUATION CONFIGURATION
  // ============================================================================

  /**
   * Get evaluation system settings
   */
  static async getEvaluationSettings(): Promise<any> {
    try {
      const response = await api.get('/settings/evaluation');
      return response.data;
    } catch (error) {
      console.error('Error fetching evaluation settings:', error);
      throw new Error('Failed to fetch evaluation settings');
    }
  }

  /**
   * Update evaluation system settings
   */
  static async updateEvaluationSettings(settings: any): Promise<any> {
    try {
      const response = await api.put('/settings/evaluation', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating evaluation settings:', error);
      throw new Error('Failed to update evaluation settings');
    }
  }

  /**
   * Get criteria templates
   */
  static async getCriteriaTemplates(): Promise<any[]> {
    try {
      const response = await api.get('/settings/criteria-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching criteria templates:', error);
      throw new Error('Failed to fetch criteria templates');
    }
  }

  /**
   * Update criteria templates
   */
  static async updateCriteriaTemplates(templates: any[]): Promise<any[]> {
    try {
      const response = await api.put('/settings/criteria-templates', { templates });
      return response.data;
    } catch (error) {
      console.error('Error updating criteria templates:', error);
      throw new Error('Failed to update criteria templates');
    }
  }

  // ============================================================================
  // BACKUP & RECOVERY
  // ============================================================================

  /**
   * Create manual backup
   */
  static async createBackup(): Promise<any> {
    try {
      const response = await api.post('/system/backup');
      return response.data;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  /**
   * Get backup status
   */
  static async getBackupStatus(): Promise<any> {
    try {
      const response = await api.get('/system/backup/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching backup status:', error);
      throw new Error('Failed to fetch backup status');
    }
  }

  /**
   * Restore from backup
   */
  static async restoreBackup(backupId: string): Promise<any> {
    try {
      const response = await api.post(`/system/backup/${backupId}/restore`);
      return response.data;
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw new Error('Failed to restore backup');
    }
  }

  // ============================================================================
  // DATA EXPORT/IMPORT
  // ============================================================================

  /**
   * Export system data
   */
  static async exportData(format: string, categories: string[]): Promise<Blob> {
    try {
      const response = await api.post('/system/export', {
        format,
        categories,
      }, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Import system data
   */
  static async importData(file: File, options: any): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));
      
      const response = await api.post('/system/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }

  // ============================================================================
  // API MANAGEMENT
  // ============================================================================

  /**
   * Generate API key
   */
  static async generateAPIKey(name: string, permissions: string[]): Promise<any> {
    try {
      const response = await api.post('/system/api/keys', {
        name,
        permissions,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating API key:', error);
      throw new Error('Failed to generate API key');
    }
  }

  /**
   * Get API keys
   */
  static async getAPIKeys(): Promise<any[]> {
    try {
      const response = await api.get('/system/api/keys');
      return response.data;
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw new Error('Failed to fetch API keys');
    }
  }

  /**
   * Revoke API key
   */
  static async revokeAPIKey(keyId: string): Promise<any> {
    try {
      const response = await api.delete(`/system/api/keys/${keyId}`);
      return response.data;
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw new Error('Failed to revoke API key');
    }
  }

  // ============================================================================
  // BRANDING & CUSTOMIZATION
  // ============================================================================

  /**
   * Upload logo
   */
  static async uploadLogo(file: File, type: 'primary' | 'secondary' | 'favicon'): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await api.post('/settings/branding/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw new Error('Failed to upload logo');
    }
  }

  /**
   * Update branding settings
   */
  static async updateBrandingSettings(branding: any): Promise<any> {
    try {
      const response = await api.put('/settings/branding', branding);
      return response.data;
    } catch (error) {
      console.error('Error updating branding settings:', error);
      throw new Error('Failed to update branding settings');
    }
  }

  // ============================================================================
  // NOTIFICATION SETTINGS
  // ============================================================================

  /**
   * Test email configuration
   */
  static async testEmailConfig(config: any): Promise<any> {
    try {
      const response = await api.post('/settings/email/test', config);
      return response.data;
    } catch (error) {
      console.error('Error testing email config:', error);
      throw new Error('Failed to test email configuration');
    }
  }

  /**
   * Send test notification
   */
  static async sendTestNotification(type: string, userId: number): Promise<any> {
    try {
      const response = await api.post('/settings/notifications/test', {
        type,
        userId,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw new Error('Failed to send test notification');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Reset settings to defaults
   */
  static async resetToDefaults(category: string): Promise<any> {
    try {
      const response = await api.post(`/settings/${category}/reset`);
      return response.data;
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw new Error('Failed to reset settings');
    }
  }

  /**
   * Validate settings configuration
   */
  static async validateSettings(settings: any): Promise<any> {
    try {
      const response = await api.post('/settings/validate', settings);
      return response.data;
    } catch (error) {
      console.error('Error validating settings:', error);
      throw new Error('Failed to validate settings');
    }
  }

  /**
   * Get settings schema
   */
  static async getSettingsSchema(): Promise<any> {
    try {
      const response = await api.get('/settings/schema');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings schema:', error);
      throw new Error('Failed to fetch settings schema');
    }
  }
}

// Export default instance
export default SettingsService;
