import { apiClient } from './api';
import { 
  FileUploadDto,
  FileInfoDto
} from '@/types';

export const fileService = {
  /**
   * Upload file
   */
  uploadFile: async (file: File): Promise<FileUploadDto> => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.upload<FileUploadDto>('/api/file/upload', formData);
  },

  /**
   * Download file
   */
  downloadFile: async (filePath: string): Promise<Blob> => {
    return await apiClient.downloadFile('/api/file/download', { filePath });
  },

  /**
   * Get file info
   */
  getFileInfo: async (filePath: string): Promise<FileInfoDto> => {
    return await apiClient.get<FileInfoDto>('/api/file/info', { filePath });
  },

  /**
   * Delete file
   */
  deleteFile: async (filePath: string): Promise<{ message: string }> => {
    return await apiClient.delete<{ message: string }>('/api/file', { filePath });
  },
};
