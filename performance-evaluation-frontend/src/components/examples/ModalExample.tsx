import React, { useState } from 'react';
import { User, Mail, Building, Phone, Calendar, Save, X } from 'lucide-react';
import { Button, Modal, Input, Card, CardContent, CardHeader, CardTitle } from '../design-system';

export const ModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hireDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.position) newErrors.position = 'Position is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Handle form submission
    console.log('Form submitted:', formData);
    setIsOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      hireDate: '',
    });
    setErrors({});
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      hireDate: '',
    });
    setErrors({});
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Modal Examples</h1>
          <p className="text-gray-500">Click the button below to open a modal dialog</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Simple Modal */}
          <Card>
            <CardHeader>
              <CardTitle>Simple Modal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                A basic modal with a simple message and action buttons.
              </p>
              <Button 
                variant="primary" 
                onClick={() => setIsOpen(true)}
                leftIcon={<User className="h-4 w-4" />}
              >
                Open Employee Modal
              </Button>
            </CardContent>
          </Card>

          {/* Modal with Form */}
          <Card>
            <CardHeader>
              <CardTitle>Form Modal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                A modal containing a form with validation and proper styling.
              </p>
              <Button 
                variant="secondary" 
                onClick={() => setIsOpen(true)}
                leftIcon={<User className="h-4 w-4" />}
              >
                Add New Employee
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title="Add New Employee"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                leftIcon={<User className="h-4 w-4" />}
                error={errors.firstName}
                required
              />

              <Input
                label="Last Name"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                leftIcon={<User className="h-4 w-4" />}
                error={errors.lastName}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                leftIcon={<Phone className="h-4 w-4" />}
                error={errors.phone}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Department"
                placeholder="Enter department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                leftIcon={<Building className="h-4 w-4" />}
                error={errors.department}
                required
              />

              <Input
                label="Position"
                placeholder="Enter position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                leftIcon={<User className="h-4 w-4" />}
                error={errors.position}
                required
              />
            </div>

            <Input
              label="Hire Date"
              type="date"
              value={formData.hireDate}
              onChange={(e) => handleInputChange('hireDate', e.target.value)}
              leftIcon={<Calendar className="h-4 w-4" />}
              error={errors.hireDate}
            />

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-500">
                All fields marked with * are required
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Employee
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ModalExample;
