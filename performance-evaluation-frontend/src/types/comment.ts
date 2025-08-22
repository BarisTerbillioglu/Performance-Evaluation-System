import { BaseEntity } from './common';

// Comment DTOs matching backend
export interface CommentDto extends BaseEntity {
  id: number;
  scoreId: number;
  description: string;
  isActive: boolean;
}

export interface CommentUpdateDto {
  id: number;
  description: string;
  updatedDate: string;
}

// Request DTOs
export interface AddCommentRequest {
  scoreId: number;
  description: string;
}

export interface UpdateCommentRequest {
  description: string;
}
