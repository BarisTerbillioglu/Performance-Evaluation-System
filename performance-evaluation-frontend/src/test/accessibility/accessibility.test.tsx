import React from 'react';
import { render } from '@/test/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form/Input';
import { Select } from '@/components/ui/form/Select';
import { DataTable } from '@/components/ui/data/DataTable';
import { Modal } from '@/components/ui/Modal';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Button>Click me</Button>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes when disabled', async () => {
      const { container } = render(
        <Button disabled>Disabled Button</Button>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes when loading', async () => {
      const { container } = render(
        <Button loading>Loading Button</Button>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Input Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Input label="Email" placeholder="Enter your email" />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper error state accessibility', async () => {
      const { container } = render(
        <Input 
          label="Email" 
          error="Invalid email address"
          aria-describedby="email-error"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper required field accessibility', async () => {
      const { container } = render(
        <Input 
          label="Email" 
          required 
          aria-required="true"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Select Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Select
          label="Department"
          options={[
            { value: '1', label: 'Engineering' },
            { value: '2', label: 'Marketing' },
          ]}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes for disabled state', async () => {
      const { container } = render(
        <Select
          label="Department"
          disabled
          options={[
            { value: '1', label: 'Engineering' },
            { value: '2', label: 'Marketing' },
          ]}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('DataTable Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <DataTable
          data={[
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
          ]}
          columns={[
            { key: 'name', title: 'Name' },
            { key: 'email', title: 'Email' },
          ]}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper table accessibility attributes', async () => {
      const { container } = render(
        <DataTable
          data={[
            { id: 1, name: 'John Doe', email: 'john@example.com' },
          ]}
          columns={[
            { key: 'name', title: 'Name' },
            { key: 'email', title: 'Email' },
          ]}
          rowKey="id"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Modal Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
        >
          <p>Modal content</p>
        </Modal>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper focus management', async () => {
      const { container } = render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
        >
          <Button>Focus me</Button>
        </Modal>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form structure', async () => {
      const { container } = render(
        <form>
          <Input label="First Name" required />
          <Input label="Last Name" required />
          <Select
            label="Department"
            options={[
              { value: '1', label: 'Engineering' },
              { value: '2', label: 'Marketing' },
            ]}
          />
          <Button type="submit">Submit</Button>
        </form>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper error handling', async () => {
      const { container } = render(
        <form>
          <Input 
            label="Email" 
            error="Invalid email format"
            aria-describedby="email-error"
          />
          <div id="email-error" role="alert">
            Invalid email format
          </div>
          <Button type="submit">Submit</Button>
        </form>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Navigation Accessibility', () => {
    it('should have proper navigation structure', async () => {
      const { container } = render(
        <nav role="navigation" aria-label="Main navigation">
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/users">Users</a></li>
            <li><a href="/teams">Teams</a></li>
          </ul>
        </nav>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast', async () => {
      const { container } = render(
        <div>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
        </div>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation', async () => {
      const { container } = render(
        <div>
          <Button>First Button</Button>
          <Button>Second Button</Button>
          <Button>Third Button</Button>
        </div>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
