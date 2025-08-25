import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/design-system/Card';
import { Button } from '../../components/design-system/Button';
import SettingsTab, { SettingsTabItem } from '../../components/settings/SettingsTab';
import SettingCard from '../../components/settings/SettingCard';
import ToggleSwitch from '../../components/settings/ToggleSwitch';
import ColorPicker from '../../components/settings/ColorPicker';
import FileUploadArea from '../../components/settings/FileUploadArea';
import { Input } from '../../components/design-system/Input';
import SettingsService from '../../services/settingsService';
import { SystemSettings, UserPreferences } from '../../types/settings';

// Icons for tabs
const TabIcons = {
  general: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  email: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  security: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  data: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  organization: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  evaluation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  reporting: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  api: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  branding: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M15 7l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
  health: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const SystemSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs: SettingsTabItem[] = [
    {
      id: 'general',
      label: 'General',
      icon: TabIcons.general,
      description: 'Application settings and defaults',
    },
    {
      id: 'email',
      label: 'Email & Notifications',
      icon: TabIcons.email,
      description: 'SMTP and notification settings',
    },
    {
      id: 'security',
      label: 'Security & Access',
      icon: TabIcons.security,
      description: 'Password policies and access control',
    },
    {
      id: 'data',
      label: 'Data & Backup',
      icon: TabIcons.data,
      description: 'Backup and data management',
    },
    {
      id: 'organization',
      label: 'Organization',
      icon: TabIcons.organization,
      description: 'Department and role management',
    },
    {
      id: 'evaluation',
      label: 'Evaluation System',
      icon: TabIcons.evaluation,
      description: 'Evaluation workflow and criteria',
    },
    {
      id: 'reporting',
      label: 'Reporting & Analytics',
      icon: TabIcons.reporting,
      description: 'Report templates and analytics',
    },
    {
      id: 'api',
      label: 'API & Integrations',
      icon: TabIcons.api,
      description: 'API management and integrations',
    },
    {
      id: 'branding',
      label: 'Branding',
      icon: TabIcons.branding,
      description: 'Visual customization and branding',
    },
    {
      id: 'health',
      label: 'System Health',
      icon: TabIcons.health,
      description: 'System monitoring and health',
    },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [system, user] = await Promise.all([
        SettingsService.getSystemSettings(),
        SettingsService.getUserPreferences(),
      ]);
      setSystemSettings(system);
      setUserPreferences(user);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!systemSettings) return;
    
    try {
      setSaving(true);
      await SettingsService.updateSystemSettings(activeTab as keyof SystemSettings, systemSettings);
      setError(null);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      await SettingsService.resetToDefaults(activeTab);
      await loadSettings();
      setError(null);
    } catch (err) {
      setError('Failed to reset settings');
      console.error('Error resetting settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure system-wide settings and preferences for the Performance Evaluation System.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="px-6 pt-6">
            <SettingsTab
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-between items-center">
              <Button
                variant="secondary"
                onClick={handleReset}
                disabled={saving}
              >
                Reset to Defaults
              </Button>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => window.history.back()}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  loading={saving}
                  disabled={!systemSettings}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function renderTabContent() {
    if (!systemSettings) return null;

    switch (activeTab) {
      case 'general':
        return <GeneralSettings settings={systemSettings.application} />;
      case 'email':
        return <EmailSettings settings={systemSettings.email} />;
      case 'security':
        return <SecuritySettings settings={systemSettings.security} />;
      case 'data':
        return <DataSettings settings={systemSettings.data} />;
      case 'organization':
        return <OrganizationSettings settings={systemSettings.organization} />;
      case 'evaluation':
        return <EvaluationSettings settings={systemSettings.evaluation} />;
      case 'reporting':
        return <ReportingSettings settings={systemSettings.reporting} />;
      case 'api':
        return <APISettings settings={systemSettings.api} />;
      case 'branding':
        return <BrandingSettings settings={systemSettings.branding} />;
      case 'health':
        return <SystemHealthSettings />;
      default:
        return <div>Select a tab to configure settings</div>;
    }
  }
};

// Tab Content Components
const GeneralSettings: React.FC<{ settings: any }> = ({ settings }) => (
  <div className="space-y-6">
    <SettingCard
      title="System Information"
      description="Basic system configuration and identification"
      icon={TabIcons.general}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="System Name"
          value={settings?.systemName || ''}
          placeholder="Performance Evaluation System"
        />
        <Input
          label="System Version"
          value={settings?.systemVersion || ''}
          placeholder="1.0.0"
        />
        <Input
          label="Default Language"
          value={settings?.defaultLanguage || ''}
          placeholder="en-US"
        />
        <Input
          label="Default Timezone"
          value={settings?.defaultTimezone || ''}
          placeholder="UTC"
        />
      </div>
    </SettingCard>

    <SettingCard
      title="Evaluation Defaults"
      description="Default settings for evaluation processes"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Evaluation Period
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <Input
          label="Default Score Scale"
          type="number"
          value={settings?.defaultScoreScale || 5}
          min={1}
          max={100}
        />
      </div>
    </SettingCard>
  </div>
);

const EmailSettings: React.FC<{ settings: any }> = ({ settings }) => (
  <div className="space-y-6">
    <SettingCard
      title="SMTP Configuration"
      description="Configure email server settings"
      icon={TabIcons.email}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="SMTP Host"
          value={settings?.smtp?.host || ''}
          placeholder="smtp.gmail.com"
        />
        <Input
          label="SMTP Port"
          type="number"
          value={settings?.smtp?.port || 587}
        />
        <Input
          label="Username"
          value={settings?.smtp?.username || ''}
          placeholder="your-email@gmail.com"
        />
        <Input
          label="Password"
          type="password"
          value={settings?.smtp?.password || ''}
        />
      </div>
    </SettingCard>

    <SettingCard
      title="Notification Preferences"
      description="Configure notification settings"
    >
      <div className="space-y-4">
        <ToggleSwitch
          label="Enable Email Notifications"
          checked={settings?.enableEmailNotifications || false}
          onChange={() => {}}
        />
        <ToggleSwitch
          label="Enable Push Notifications"
          checked={settings?.enablePushNotifications || false}
          onChange={() => {}}
        />
        <ToggleSwitch
          label="Enable SMS Notifications"
          checked={settings?.enableSMSNotifications || false}
          onChange={() => {}}
        />
      </div>
    </SettingCard>
  </div>
);

const SecuritySettings: React.FC<{ settings: any }> = ({ settings }) => (
  <div className="space-y-6">
    <SettingCard
      title="Password Policy"
      description="Configure password requirements and policies"
      icon={TabIcons.security}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Minimum Length"
          type="number"
          value={settings?.passwordPolicy?.minLength || 8}
          min={6}
          max={50}
        />
        <Input
          label="Password Expiration (days)"
          type="number"
          value={settings?.passwordPolicy?.passwordExpirationDays || 90}
          min={0}
        />
      </div>
      <div className="mt-4 space-y-3">
        <ToggleSwitch
          label="Require Uppercase Letters"
          checked={settings?.passwordPolicy?.requireUppercase || false}
          onChange={() => {}}
        />
        <ToggleSwitch
          label="Require Numbers"
          checked={settings?.passwordPolicy?.requireNumbers || false}
          onChange={() => {}}
        />
        <ToggleSwitch
          label="Require Special Characters"
          checked={settings?.passwordPolicy?.requireSpecialChars || false}
          onChange={() => {}}
        />
      </div>
    </SettingCard>

    <SettingCard
      title="Multi-Factor Authentication"
      description="Configure MFA settings"
    >
      <div className="space-y-4">
        <ToggleSwitch
          label="Enable Multi-Factor Authentication"
          checked={settings?.enableMFA || false}
          onChange={() => {}}
        />
        <ToggleSwitch
          label="Require MFA for Administrators"
          checked={settings?.mfaRequiredForAdmins || false}
          onChange={() => {}}
        />
      </div>
    </SettingCard>
  </div>
);

const DataSettings: React.FC<{ settings: any }> = ({ settings }) => (
  <div className="space-y-6">
    <SettingCard
      title="Backup Configuration"
      description="Configure automated backup settings"
      icon={TabIcons.data}
    >
      <div className="space-y-4">
        <ToggleSwitch
          label="Enable Automatic Backup"
          checked={settings?.backup?.enableAutomaticBackup || false}
          onChange={() => {}}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Frequency
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <Input
            label="Backup Retention (days)"
            type="number"
            value={settings?.backup?.backupRetentionDays || 30}
            min={1}
          />
        </div>
      </div>
    </SettingCard>
  </div>
);

const OrganizationSettings: React.FC<{ settings: any }> = ({ settings }) => (
  <div className="space-y-6">
    <SettingCard
      title="Department Management"
      description="Configure department settings and hierarchy"
      icon={TabIcons.organization}
    >
      <div className="space-y-4">
        <ToggleSwitch
          label="Enable Department Hierarchy"
          checked={settings?.hierarchy?.enableDepartmentHierarchy || false}
          onChange={() => {}}
        />
        <Input
          label="Maximum Hierarchy Depth"
          type="number"
          value={settings?.hierarchy?.maxHierarchyDepth || 5}
          min={1}
          max={10}
        />
      </div>
    </SettingCard>
  </div>
);

const EvaluationSettings: React.FC<{ settings: any }> = ({ settings }) => (
  <div className="space-y-6">
    <SettingCard
      title="Workflow Configuration"
      description="Configure evaluation workflow settings"
      icon={TabIcons.evaluation}
    >
      <div className="space-y-4">
        <ToggleSwitch
          label="Require Approval"
          checked={settings?.workflow?.approvalRequired || false}
          onChange={() => {}}
        />
        <ToggleSwitch
          label="Multi-Step Evaluation"
          checked={settings?.workflow?.multiStepEvaluation || false}
          onChange={() => {}}
        />
        <ToggleSwitch
          label="Enforce Deadlines"
          checked={settings?.workflow?.enforceDeadlines || false}
          onChange={() => {}}
        />
      </div>
    </SettingCard>
  </div>
);

const ReportingSettings: React.FC<{ settings: any }> = ({ settings }) => (
  <div className="space-y-6">
    <SettingCard
      title="Report Configuration"
      description="Configure report templates and settings"
      icon={TabIcons.reporting}
    >
      <div className="space-y-4">
        <ToggleSwitch
          label="Enable Custom Report Builder"
          checked={settings?.reports?.customReportBuilder || false}
          onChange={() => {}}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Export Format
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>
    </SettingCard>
  </div>
);

const APISettings: React.FC<{ settings: any }> = ({ settings }) => (
  <div className="space-y-6">
    <SettingCard
      title="API Management"
      description="Configure API settings and access"
      icon={TabIcons.api}
    >
      <div className="space-y-4">
        <ToggleSwitch
          label="Enable API Access"
          checked={settings?.management?.enableAPI || false}
          onChange={() => {}}
        />
        <Input
          label="Rate Limit (requests per minute)"
          type="number"
          value={settings?.management?.rateLimiting?.requestsPerMinute || 100}
          min={1}
        />
      </div>
    </SettingCard>
  </div>
);

const BrandingSettings: React.FC<{ settings: any }> = ({ settings }) => (
  <div className="space-y-6">
    <SettingCard
      title="Visual Branding"
      description="Configure visual appearance and branding"
      icon={TabIcons.branding}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadArea
          label="Primary Logo"
          description="Upload your primary logo (PNG, JPG, SVG)"
          currentFile={settings?.visual?.logo?.primaryLogo}
          onFileSelect={() => {}}
        />
        <ColorPicker
          label="Primary Color"
          value={settings?.visual?.colorScheme?.primaryColor || '#FFD700'}
          onChange={() => {}}
        />
      </div>
    </SettingCard>
  </div>
);

const SystemHealthSettings: React.FC = () => (
  <div className="space-y-6">
    <SettingCard
      title="System Monitoring"
      description="Monitor system health and performance"
      icon={TabIcons.health}
    >
      <div className="space-y-4">
        <ToggleSwitch
          label="Enable Performance Monitoring"
          checked={true}
          onChange={() => {}}
        />
        <ToggleSwitch
          label="Enable Error Tracking"
          checked={true}
          onChange={() => {}}
        />
      </div>
    </SettingCard>
  </div>
);

export default SystemSettingsPage;
