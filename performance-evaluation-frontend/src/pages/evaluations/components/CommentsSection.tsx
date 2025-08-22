import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChatBubbleLeftIcon 
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { TextArea } from '@/components/ui/form';
import { Badge } from '@/components/ui/feedback';
import { useAuth } from '@/store';
import { evaluationService } from '@/services/evaluationService';
import { CommentDto, AddCommentRequest, UpdateCommentRequest } from '@/types';
import { formatFullName } from '@/utils';

interface CommentsSectionProps {
  scoreId: number;
  readOnly?: boolean;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  scoreId, 
  readOnly = false 
}) => {
  const { state } = useAuth();
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<{ id: number; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [scoreId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getScoreComments(scoreId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const request: AddCommentRequest = {
        scoreId,
        description: newComment.trim()
      };
      
      const comment = await evaluationService.addComment(request);
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: number, description: string) => {
    try {
      const request: UpdateCommentRequest = { description };
      const updatedComment = await evaluationService.updateComment(commentId, request);
      
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? updatedComment : comment
        )
      );
      setEditingComment(null);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await evaluationService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const canEditComment = (comment: CommentDto) => {
    return !readOnly && (
      state.user?.id === comment.createdBy || 
      state.user?.roles?.includes('Admin') ||
      state.user?.roles?.includes('Manager')
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingComment?.id === comment.id ? (
                    <div className="space-y-3">
                      <TextArea
                        value={editingComment.text}
                        onChange={(e) => setEditingComment({ 
                          id: comment.id, 
                          text: e.target.value 
                        })}
                        rows={3}
                        placeholder="Edit comment..."
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateComment(comment.id, editingComment.text)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingComment(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {comment.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdDate).toLocaleDateString()}
                        </span>
                        {comment.lastModifiedDate !== comment.createdDate && (
                          <Badge variant="secondary" size="sm">
                            Edited
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {canEditComment(comment) && editingComment?.id !== comment.id && (
                  <div className="flex space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingComment({ 
                        id: comment.id, 
                        text: comment.description 
                      })}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <ChatBubbleLeftIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No comments yet</p>
        </div>
      )}

      {/* Add Comment */}
      {!readOnly && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || submitting}
              leftIcon={<PlusIcon className="w-4 h-4" />}
              size="sm"
            >
              {submitting ? 'Adding...' : 'Add Comment'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
