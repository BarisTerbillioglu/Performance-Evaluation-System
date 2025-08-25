import React from 'react';
import { TeamTemplateDto } from '@/types';
import { Modal } from '@/components/ui/feedback/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

export interface TeamTemplatesModalProps {
  templates: TeamTemplateDto[];
  onClose: () => void;
  onSuccess: () => void;
}

export const TeamTemplatesModal: React.FC<TeamTemplatesModalProps> = ({
  templates,
  onClose,
  onSuccess,
}) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Team Templates"
      size="lg"
    >
      <div className="space-y-6">
        <p className="text-gray-600">
          Team templates allow you to quickly create teams with predefined structures.
        </p>
        
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
