import React, { useState, useEffect } from 'react';
import { Modal } from '../design-system/Modal';
import { Button } from '../design-system/Button';
import { Input } from '../design-system/Input';
import SettingCard from './SettingCard';
import ToggleSwitch from './ToggleSwitch';
import SettingsService from '../../services/settingsService';
import { UserPreferences } from '../../types/settings';

export interface UserPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
}

const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'evaluation', label: 'Evaluation', icon: '📋' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen, userId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const userPrefs = await SettingsService.getUserPreferences();
      setPreferences(userPrefs);
    } catch (err) {
      setError('Failed to load preferences');
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await SettingsService.updateUserPreferences(activeTab as keyof UserPreferences, preferences);
      setError(null);
      onClose();
    } catch (err) {
      setError('Failed to save preferences');
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  const updatePreference = (category: keyof UserPreferences, field: string, value: any) => {
    if (!preferences) return;

    setPreferences(prev => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading preferences...</p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Preferences</h2>
          <p className="mt-1 text-gray-600">
            Customize your personal settings and preferences.
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

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!preferences}
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </Modal>
  );

  function renderTabContent() {
    if (!preferences) return null;

    switch (activeTab) {
      case 'personal':
        return <PersonalSettings preferences={preferences.personal} />;
      case 'dashboard':
        return <DashboardSettings preferences={preferences.dashboard} />;
      case 'evaluation':
        return <EvaluationSettings preferences={preferences.evaluation} />;
      case 'notifications':
        return <NotificationSettings preferences={preferences.notifications} />;
      default:
        return null;
    }
  }

  function PersonalSettings({ preferences }: { preferences: any }) {
    return (
      <div className="space-y-6">
        <SettingCard
          title="Personal Information"
          description="Update your personal details and contact information"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              value={preferences?.firstName || ''}
              onChange={(e) => updatePreference('personal', 'firstName', e.target.value)}
            />
            <Input
              label="Last Name"
              value={preferences?.lastName || ''}
              onChange={(e) => updatePreference('personal', 'lastName', e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={preferences?.email || ''}
              onChange={(e) => updatePreference('personal', 'email', e.target.value)}
            />
            <Input
              label="Phone"
              value={preferences?.phone || ''}
              onChange={(e) => updatePreference('personal', 'phone', e.target.value)}
            />
          </div>
        </SettingCard>

        <SettingCard
          title="Localization"
          description="Set your language and timezone preferences"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                value={preferences?.language || 'en-US'}
                onChange={(e) => updatePreference('personal', 'language', e.target.value)}
              >
                <option value="en-US">English (US)</option>
                <option value="tr-TR">Türkçe</option>
                <option value="de-DE">Deutsch</option>
                <option value="fr-FR">Français</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                value={preferences?.timezone || 'UTC'}
                onChange={(e) => updatePreference('personal', 'timezone', e.target.value)}
              >
                <option value="UTC">UTC</option>
                <option value="Europe/Istanbul">Europe/Istanbul</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                value={preferences?.dateFormat || 'MM/DD/YYYY'}
                onChange={(e) => updatePreference('personal', 'dateFormat', e.target.value)}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Format
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                value={preferences?.timeFormat || '12h'}
                onChange={(e) => updatePreference('personal', 'timeFormat', e.target.value)}
              >
                <option value="12h">12-hour</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>
        </SettingCard>
      </div>
    );
  }

  function DashboardSettings({ preferences }: { preferences: any }) {
    return (
      <div className="space-y-6">
        <SettingCard
          title="Dashboard Layout"
          description="Customize your dashboard appearance and layout"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Style
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                value={preferences?.layout || 'grid'}
                onChange={(e) => updatePreference('dashboard', 'layout', e.target.value)}
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="compact">Compact</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default View
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                value={preferences?.defaultView || 'overview'}
                onChange={(e) => updatePreference('dashboard', 'defaultView', e.target.value)}
              >
                <option value="overview">Overview</option>
                <option value="evaluations">Evaluations</option>
                <option value="reports">Reports</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                value={preferences?.chartType || 'bar'}
                onChange={(e) => updatePreference('dashboard', 'chartType', e.target.value)}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="radar">Radar Chart</option>
              </select>
            </div>
            <Input
              label="Refresh Interval (seconds)"
              type="number"
              value={preferences?.refreshInterval || 30}
              min={5}
              max={300}
              onChange={(e) => updatePreference('dashboard', 'refreshInterval', parseInt(e.target.value))}
            />
          </div>
        </SettingCard>

        <SettingCard
          title="Widget Preferences"
          description="Configure which widgets to display on your dashboard"
        >
          <div className="space-y-3">
            <ToggleSwitch
              label="Show Notifications Widget"
              checked={preferences?.showNotifications || false}
              onChange={(checked) => updatePreference('dashboard', 'showNotifications', checked)}
            />
            <ToggleSwitch
              label="Show Recent Evaluations"
              checked={true}
              onChange={() => {}}
            />
            <ToggleSwitch
              label="Show Performance Metrics"
              checked={true}
              onChange={() => {}}
            />
            <ToggleSwitch
              label="Show Team Overview"
              checked={true}
              onChange={() => {}}
            />
          </div>
        </SettingCard>
      </div>
    );
  }

  function EvaluationSettings({ preferences }: { preferences: any }) {
    return (
      <div className="space-y-6">
        <SettingCard
          title="Evaluation Preferences"
          description="Configure your evaluation workflow preferences"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Period
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                value={preferences?.defaultPeriod || 'quarterly'}
                onChange={(e) => updatePreference('evaluation', 'defaultPeriod', e.target.value)}
              >
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <Input
              label="Auto-save Frequency (seconds)"
              type="number"
              value={preferences?.autoSaveFrequency || 30}
              min={10}
              max={300}
              onChange={(e) => updatePreference('evaluation', 'autoSaveFrequency', parseInt(e.target.value))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score Display Format
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                value={preferences?.scoreDisplayFormat || 'number'}
                onChange={(e) => updatePreference('evaluation', 'scoreDisplayFormat', e.target.value)}
              >
                <option value="number">Number</option>
                <option value="percentage">Percentage</option>
                <option value="letter">Letter Grade</option>
              </select>
            </div>
          </div>
        </SettingCard>

        <SettingCard
          title="Evaluation Workflow"
          description="Configure evaluation process preferences"
        >
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Reminders"
              checked={preferences?.enableReminders || false}
              onChange={(checked) => updatePreference('evaluation', 'enableReminders', checked)}
            />
            <ToggleSwitch
              label="Progress Tracking"
              checked={preferences?.progressTracking || false}
              onChange={(checked) => updatePreference('evaluation', 'progressTracking', checked)}
            />
          </div>
        </SettingCard>
      </div>
    );
  }

  function NotificationSettings({ preferences }: { preferences: any }) {
    return (
      <div className="space-y-6">
        <SettingCard
          title="Notification Channels"
          description="Configure how you receive notifications"
        >
          <div className="space-y-4">
            <ToggleSwitch
              label="Email Notifications"
              checked={preferences?.email?.enabled || false}
              onChange={(checked) => updatePreference('notifications', 'email', { ...preferences?.email, enabled: checked })}
            />
            <ToggleSwitch
              label="Push Notifications"
              checked={preferences?.push?.enabled || false}
              onChange={(checked) => updatePreference('notifications', 'push', { ...preferences?.push, enabled: checked })}
            />
            <ToggleSwitch
              label="SMS Notifications"
              checked={preferences?.sms?.enabled || false}
              onChange={(checked) => updatePreference('notifications', 'sms', { ...preferences?.sms, enabled: checked })}
            />
            <ToggleSwitch
              label="In-App Notifications"
              checked={preferences?.inApp?.enabled || false}
              onChange={(checked) => updatePreference('notifications', 'inApp', { ...preferences?.inApp, enabled: checked })}
            />
          </div>
        </SettingCard>

        <SettingCard
          title="Notification Types"
          description="Choose which types of notifications to receive"
        >
          <div className="space-y-3">
            <ToggleSwitch
              label="Evaluation Reminders"
              checked={preferences?.evaluationReminders || false}
              onChange={(checked) => updatePreference('notifications', 'evaluationReminders', checked)}
            />
            <ToggleSwitch
              label="System Updates"
              checked={preferences?.systemUpdates || false}
              onChange={(checked) => updatePreference('notifications', 'systemUpdates', checked)}
            />
            <ToggleSwitch
              label="Report Notifications"
              checked={preferences?.reportNotifications || false}
              onChange={(checked) => updatePreference('notifications', 'reportNotifications', checked)}
            />
            <ToggleSwitch
              label="Team Updates"
              checked={preferences?.teamUpdates || false}
              onChange={(checked) => updatePreference('notifications', 'teamUpdates', checked)}
            />
          </div>
        </SettingCard>
      </div>
    );
  }
};

export default UserPreferencesModal;
