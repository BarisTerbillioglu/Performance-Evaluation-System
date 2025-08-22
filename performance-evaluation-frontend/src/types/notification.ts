import { BaseEntity } from './common';

// Notification DTOs
export interface NotificationDto extends BaseEntity {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export interface NotificationSummaryDto {
  totalCount: number;
  unreadCount: number;
  recentNotifications: NotificationDto[];
}

export interface NotificationPreferencesDto {
  userId: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  evaluationReminders: boolean;
  systemUpdates: boolean;
  weeklyReports: boolean;
}

export interface EmailNotificationDto {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  template?: string;
  templateData?: Record<string, unknown>;
}

// Request DTOs
export interface CreateNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export interface BulkNotificationRequest {
  userIds: number[];
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export interface SendNotificationRequest {
  recipients: number[];
  title: string;
  message: string;
  type: NotificationType;
  scheduleFor?: string;
}

export interface ScheduleNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  scheduledFor: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export interface MarkNotificationsReadRequest {
  notificationIds: number[];
}

export interface TestNotificationRequest {
  userId: number;
  type: NotificationType;
  message: string;
}

// Enums
export enum NotificationType {
  Information = 'Information',
  Warning = 'Warning',
  Error = 'Error',
  Success = 'Success',
  EvaluationDue = 'EvaluationDue',
  EvaluationCompleted = 'EvaluationCompleted',
  SystemUpdate = 'SystemUpdate'
}
