import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form/Input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/feedback/Alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/Select';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/form/RadioGroup';
import { Switch } from '@/components/ui/form/Switch';
import { Textarea } from '@/components/ui/form/Textarea';
import { DatePicker } from '@/components/ui/form/DatePicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/Tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/navigation/Accordion';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalTrigger } from '@/components/ui/overlay/Modal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/overlay/Tooltip';
import { Progress } from '@/components/ui/feedback/Progress';
import { Skeleton } from '@/components/ui/feedback/Skeleton';
import { Separator } from '@/components/ui/layout/Separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data/Avatar';
import { DataTable } from '@/components/ui/data/DataTable';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  ThumbsUpIcon,
  EyeIcon,
  DownloadIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const DesignSystemShowcase: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('buttons');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    category: '',
    notifications: false,
    theme: 'light',
    date: new Date(),
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'Active' },
  ];

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Role' },
    { key: 'status', title: 'Status' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Design System Showcase</h1>
          <p className="text-gray-600">A comprehensive overview of all UI components</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="overlay">Overlay</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="complete">Complete</TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="destructive">Destructive Button</Button>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button size="sm">Small Button</Button>
                  <Button size="default">Default Size</Button>
                  <Button size="lg">Large Button</Button>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button disabled>Disabled Button</Button>
                  <Button>
                    <UserIcon className="mr-2 h-4 w-4" />
                    With Icon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Enter your message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <DatePicker
                    selected={formData.date}
                    onChange={(date) => handleInputChange('date', date)}
                    placeholderText="Select a date"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifications"
                      checked={formData.notifications}
                      onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                    />
                    <label htmlFor="notifications" className="text-sm font-medium">
                      Enable notifications
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Theme</label>
                    <RadioGroup value={formData.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <label htmlFor="light">Light</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark" />
                        <label htmlFor="dark">Dark</label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="airplane-mode"
                      checked={formData.notifications}
                      onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                    />
                    <label htmlFor="airplane-mode" className="text-sm font-medium">
                      Airplane mode
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Alert>
                    <AlertDescription>This is a default alert message.</AlertDescription>
                  </Alert>
                  
                  <Alert variant="destructive">
                    <AlertDescription>This is a destructive alert message.</AlertDescription>
                  </Alert>
                  
                  <Alert variant="success">
                    <AlertDescription>This is a success alert message.</AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Progress</label>
                  <Progress value={33} className="w-full" />
                  <Progress value={66} className="w-full" />
                  <Progress value={100} className="w-full" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Skeleton</label>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navigation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Navigation Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is it styled?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It comes with default styles that matches the other components&apos; aesthetic.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overlay" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overlay Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Modal>
                    <ModalTrigger asChild>
                      <Button>Open Modal</Button>
                    </ModalTrigger>
                    <ModalContent>
                      <ModalHeader>
                        <ModalTitle>Example Modal</ModalTitle>
                      </ModalHeader>
                      <div className="p-4">
                        <p>This is an example modal content.</p>
                      </div>
                    </ModalContent>
                  </Modal>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">Hover me</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This is a tooltip</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>

                <DataTable data={sampleData} columns={columns} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p>Content above separator</p>
                  <Separator className="my-4" />
                  <p>Content below separator</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complete" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Form Example</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" placeholder="john@example.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea placeholder="Tell us about yourself..." rows={4} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" />
                      <label htmlFor="terms" className="text-sm">
                        I agree to the terms and conditions
                      </label>
                    </div>
                    <Button type="submit">Submit</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export { DesignSystemShowcase };
