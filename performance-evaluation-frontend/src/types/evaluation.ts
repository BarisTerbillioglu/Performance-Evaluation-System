// Evaluation types
import { CriteriaWithScoreDto } from './criteria';

// Evaluation DTOs matching backend
export interface EvaluationDto {
  id: number;
  evaluatorId: number;
  employeeId: number;
  period: string;
  startDate: string;
  endDate: string;
  status: string;
  totalScore: number;
  generalComments?: string;
  createdDate: string;
  completedDate?: string;
}

export interface EvaluationListDto {
  id: number;
  employeeName: string;
  evaluatorName: string;
  departmentName: string;
  period: string;
  status: string;
  totalScore: number;
  createdDate: string;
  completedDate?: string;
}

export interface EvaluationFormDto {
  evaluationId: number;
  employeeName: string;
  evaluatorName: string;
  period: string;
  status: string;
  totalScore: number;
  generalComments?: string;
  criteriaWithScores: CriteriaWithScoreDto[];
}

export interface EvaluationSummaryDto {
  id: number;
  employeeName: string;
  period: string;
  status: string;
  totalScore: number;
  completedDate?: string;
}

export interface EvaluationDashboardDto {
  totalEvaluations: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  overdueEvaluations: number;
  averageScore: number;
  recentEvaluations: EvaluationSummaryDto[];
}

// Request DTOs
export interface CreateEvaluationRequest {
  employeeId: number;
  evaluatorId: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface UpdateEvaluationRequest {
  period?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  generalComments?: string;
}

export interface UpdateEvaluationBasicInfoRequest {
  period: string;
  startDate: string;
  endDate: string;
}

// Evaluation Status enum
export enum EvaluationStatus {
  Draft = 'Draft',
  InProgress = 'InProgress',
  Submitted = 'Submitted',
  Completed = 'Completed',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled'
}

// Evaluation Score DTOs
export interface EvaluationScoreDto {
  id: number;
  evaluationId: number;
  criteriaId: number;
  criteriaName: string;
  score: number;
  createdDate: string;
}

export interface UpdateScoreRequest {
  criteriaId: number;
  score: number;
}
