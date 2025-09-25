import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Input, 
  Badge, 
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from './design-system';
import {
  LoginForm,
  DashboardHeader,
  DataTable,
  DashboardCards,
  SidebarNavigation,
  ModalExample,
  VakifBankDashboard
} from './examples';

export const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('components');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = [
    { id: 'components', name: 'Components', icon: '🧩' },
    { id: 'examples', name: 'Examples', icon: '📱' },
    { id: 'vakifbank', name: 'VakıfBank Style', icon: '🏦' },
    { id: 'colors', name: 'Colors', icon: '🎨' },
    { id: 'typography', name: 'Typography', icon: '📝' },
  ];

  const colorPalette = [
    { name: 'Primary', colors: ['primary-50', 'primary-100', 'primary-200', 'primary-300', 'primary-400', 'primary-500', 'primary-600', 'primary-700', 'primary-800', 'primary-900'] },
    { name: 'Success', colors: ['success-50', 'success-100', 'success-200', 'success-300', 'success-400', 'success-500', 'success-600', 'success-700', 'success-800', 'success-900'] },
    { name: 'Warning', colors: ['warning-50', 'warning-100', 'warning-200', 'warning-300', 'warning-400', 'warning-500', 'warning-600', 'warning-700', 'warning-800', 'warning-900'] },
    { name: 'Error', colors: ['error-50', 'error-100', 'error-200', 'error-300', 'error-400', 'error-500', 'error-600', 'error-700', 'error-800', 'error-900'] },
    { name: 'Info', colors: ['info-50', 'info-100', 'info-200', 'info-300', 'info-400', 'info-500', 'info-600', 'info-700', 'info-800', 'info-900'] },
    { name: 'Gray', colors: ['gray-50', 'gray-100', 'gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800', 'gray-900'] },
  ];

  const typographyExamples = [
    { name: 'Heading 1', class: 'text-4xl font-bold', text: 'Heading 1 - 36px' },
    { name: 'Heading 2', class: 'text-3xl font-bold', text: 'Heading 2 - 30px' },
    { name: 'Heading 3', class: 'text-2xl font-bold', text: 'Heading 3 - 24px' },
    { name: 'Heading 4', class: 'text-xl font-bold', text: 'Heading 4 - 20px' },
    { name: 'Heading 5', class: 'text-lg font-bold', text: 'Heading 5 - 18px' },
    { name: 'Heading 6', class: 'text-base font-bold', text: 'Heading 6 - 16px' },
    { name: 'Body Large', class: 'text-lg', text: 'Body Large - 18px' },
    { name: 'Body', class: 'text-base', text: 'Body - 16px' },
    { name: 'Body Small', class: 'text-sm', text: 'Body Small - 14px' },
    { name: 'Caption', class: 'text-xs', text: 'Caption - 12px' },
  ];

  const renderComponents = () => (
    <div className="space-y-8">
      {/* Buttons */}
      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Button Hierarchy (VakıfBank Style)</h3>
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-black mb-3">Primary Actions</h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary Action</Button>
                <Button variant="primary" size="lg">Large Primary</Button>
                <Button variant="primary" loading>Loading</Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-black mb-3">Secondary Actions</h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="ghost">Ghost Action</Button>
                <Button variant="secondary" disabled>Disabled</Button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-black mb-3">Strong CTAs (Internet Banking Style)</h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="black">Internet Banking</Button>
                <Button variant="black" size="lg">Strong CTA</Button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-black mb-3">Status Actions</h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="success">Success Action</Button>
                <Button variant="danger">Danger Action</Button>
                <Button variant="info">Info Action</Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-black mb-3">Button Sizes</h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
                <Button variant="primary" size="xl">Extra Large</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cards */}
      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Cards (VakıfBank Style)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Standard white background card.</p>
            </CardContent>
          </Card>

          <Card variant="accent">
            <CardHeader>
              <CardTitle>Accent Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Yellow accent background for key metrics.</p>
            </CardContent>
          </Card>

          <Card variant="highlight">
            <CardHeader>
              <CardTitle>Highlight Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white opacity-90">Important information with yellow background.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Inputs</h3>
        <Card>
          <CardHeader>
            <CardTitle>Input Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Default Input" placeholder="Enter text..." />
              <Input label="With Error" placeholder="Error state" error="This field is required" />
              <Input label="With Help" placeholder="Help text" help="This is helpful information" />
              <Input label="Disabled" placeholder="Disabled" disabled />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Small" size="sm" placeholder="Small input" />
              <Input label="Medium" size="md" placeholder="Medium input" />
              <Input label="Large" size="lg" placeholder="Large input" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Badges */}
      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Badges</h3>
        <Card>
          <CardHeader>
            <CardTitle>Badge Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <Badge variant="primary" size="sm">Small</Badge>
              <Badge variant="primary" size="md">Medium</Badge>
              <Badge variant="primary" size="lg">Large</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tables */}
      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Tables</h3>
        <Card>
          <CardHeader>
            <CardTitle>Data Table</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>John Doe</TableCell>
                  <TableCell>Engineering</TableCell>
                  <TableCell><Badge variant="success">Active</Badge></TableCell>
                  <TableCell>85%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>Marketing</TableCell>
                  <TableCell><Badge variant="warning">Pending</Badge></TableCell>
                  <TableCell>92%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mike Johnson</TableCell>
                  <TableCell>Sales</TableCell>
                  <TableCell><Badge variant="error">Inactive</Badge></TableCell>
                  <TableCell>78%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );

  const renderExamples = () => (
    <div className="space-y-8">
      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Login Form</h3>
        <LoginForm />
      </section>

      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Dashboard Header</h3>
        <DashboardHeader />
      </section>

      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Data Table</h3>
        <DataTable />
      </section>

      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Dashboard Cards</h3>
        <DashboardCards />
      </section>

      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Sidebar Navigation</h3>
        <SidebarNavigation />
      </section>

      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Modal Example</h3>
        <ModalExample />
      </section>
    </div>
  );

  const renderVakifBankStyle = () => (
    <div className="space-y-8">
      <section>
        <h3 className="text-2xl font-bold text-black mb-4">VakıfBank Dashboard</h3>
        <p className="text-gray-500 mb-6">
          A complete dashboard example showcasing VakıfBank's design principles:
          clean white backgrounds, yellow accent cards for key metrics, and professional spacing.
        </p>
        <VakifBankDashboard />
      </section>

      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Design Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Usage Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">White (Backgrounds)</span>
                  <span className="text-sm text-gray-500">80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Yellow (Accents)</span>
                  <span className="text-sm text-gray-500">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Black/Gray (Text)</span>
                  <span className="text-sm text-gray-500">5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-black h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Button variant="primary" size="sm">Primary</Button>
                  <span className="text-sm text-gray-500">Main actions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <span className="text-sm text-gray-500">Alternative actions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="black" size="sm">Strong CTA</Button>
                  <span className="text-sm text-gray-500">Internet Banking style</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="danger" size="sm">Danger</Button>
                  <span className="text-sm text-gray-500">Destructive actions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );

  const renderColors = () => (
    <div className="space-y-8">
      {colorPalette.map((palette) => (
        <section key={palette.name}>
          <h3 className="text-xl font-bold text-black mb-4">{palette.name} Colors</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {palette.colors.map((color) => (
              <div key={color} className="text-center">
                <div 
                  className={`w-full h-16 rounded-lg border border-gray-200 bg-${color}`}
                  title={color}
                />
                <p className="text-xs text-gray-500 mt-1">{color.split('-')[1]}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  const renderTypography = () => (
    <div className="space-y-8">
      <section>
        <h3 className="text-2xl font-bold text-black mb-4">Typography Scale</h3>
        <Card>
          <CardContent className="space-y-4">
            {typographyExamples.map((example) => (
              <div key={example.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">{example.name}</p>
                  <p className={example.class}>{example.text}</p>
                </div>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{example.class}</code>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VB</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-black">
                  VakıfBank Design System
                </h1>
              </div>
            </div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'components' && renderComponents()}
        {activeTab === 'examples' && renderExamples()}
        {activeTab === 'vakifbank' && renderVakifBankStyle()}
        {activeTab === 'colors' && renderColors()}
        {activeTab === 'typography' && renderTypography()}
      </main>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="VakıfBank Design System Modal"
      >
        <p className="text-gray-500 mb-4">
          This is an example modal dialog showcasing the VakıfBank-inspired design system with proper button hierarchy and professional styling.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DesignSystemShowcase;
