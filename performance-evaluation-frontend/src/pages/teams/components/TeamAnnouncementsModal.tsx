import React from 'react';
import { Modal } from '@/components/ui/feedback/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

export interface TeamAnnouncementsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const TeamAnnouncementsModal: React.FC<TeamAnnouncementsModalProps> = ({
  onClose,
  onSuccess,
}) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Team Announcements"
      size="lg"
    >
      <div className="space-y-6">
        <p className="text-gray-600">
          Manage team announcements and communications.
        </p>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Team announcements management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
