import { http, HttpResponse } from 'msw';
import { 
  UserDto,
  DepartmentDto,
  TeamDto,
  CriteriaDto,
  EvaluationDto,
  UserSearchDto,
  TeamWithMembersDto,
  PaginatedResponse
} from '@/types';

const API_BASE_URL = 'http://localhost:5282';

// Mock data
const mockUsers: UserDto[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    departmentId: 1,
    departmentName: 'Engineering',
    roleIds: [1, 2],
    roleNames: ['Employee', 'Evaluator'],
    isActive: true,
    createdDate: new Date('2024-01-01'),
    updatedDate: new Date('2024-01-15'),
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    departmentId: 1,
    departmentName: 'Engineering',
    roleIds: [1],
    roleNames: ['Employee'],
    isActive: true,
    createdDate: new Date('2024-01-02'),
    updatedDate: new Date('2024-01-16'),
  },
];

const mockDepartments: DepartmentDto[] = [
  {
    id: 1,
    name: 'Engineering',
    description: 'Software Engineering Department',
    isActive: true,
    createdDate: new Date('2024-01-01'),
    updatedDate: new Date('2024-01-15'),
    userCount: 25,
  },
  {
    id: 2,
    name: 'Marketing',
    description: 'Marketing Department',
    isActive: true,
    createdDate: new Date('2024-01-01'),
    updatedDate: new Date('2024-01-15'),
    userCount: 15,
  },
  {
    id: 3,
    name: 'Sales',
    description: 'Sales Department',
    isActive: true,
    createdDate: new Date('2024-01-01'),
    updatedDate: new Date('2024-01-15'),
    userCount: 20,
  },
];

const mockRoles = [
  {
    id: 1,
    name: 'Developer',
    description: 'Software Developer',
    isActive: true,
    createdDate: new Date('2024-01-01'),
    updatedDate: new Date('2024-01-15'),
    permissions: ['read', 'write'],
  },
  {
    id: 2,
    name: 'Team Lead',
    description: 'Team Leader',
    isActive: true,
    createdDate: new Date('2024-01-01'),
    updatedDate: new Date('2024-01-15'),
    permissions: ['read', 'write', 'manage'],
  },
  {
    id: 3,
    name: 'Manager',
    description: 'Department Manager',
    isActive: true,
    createdDate: new Date('2024-01-01'),
    updatedDate: new Date('2024-01-15'),
    permissions: ['read', 'write', 'manage', 'admin'],
  },
];

const mockCriteria: CriteriaDto[] = [
  {
    id: 1,
    categoryId: 1,
    name: 'Code Quality',
    baseDescription: 'Ability to write clean, maintainable code',
    categoryName: 'Technical Skills',
    categoryWeight: 30,
    isActive: true,
    createdDate: new Date('2024-01-01'),
    roleDescriptions: [],
  },
  {
    id: 2,
    categoryId: 1,
    name: 'Problem Solving',
    baseDescription: 'Ability to analyze and solve complex problems',
    categoryName: 'Technical Skills',
    categoryWeight: 25,
    isActive: true,
    createdDate: new Date('2024-01-01'),
    roleDescriptions: [],
  },
];

const mockEvaluations: EvaluationDto[] = [
  {
    id: 1,
    evaluatorId: 1,
    evaluatorName: 'John Doe',
    employeeId: 2,
    employeeName: 'Jane Smith',
    departmentName: 'Engineering',
    period: 'Q1 2024',
    status: 'In Progress',
    totalScore: 85,
    createdDate: new Date('2024-01-01'),
    completedDate: undefined,
  },
  {
    id: 2,
    evaluatorId: 1,
    evaluatorName: 'John Doe',
    employeeId: 3,
    employeeName: 'Bob Johnson',
    departmentName: 'Engineering',
    period: 'Q1 2024',
    status: 'Completed',
    totalScore: 92,
    createdDate: new Date('2024-01-01'),
    completedDate: new Date('2024-01-15'),
  },
];

const mockTeams: TeamDto[] = [
  {
    id: 1,
    name: 'Frontend Team',
    description: 'Frontend Development Team',
    isActive: true,
    createdDate: new Date('2024-01-01'),
    memberCount: 8,
    evaluatorId: 1,
    evaluatorName: 'John Doe',
  },
  {
    id: 2,
    name: 'Backend Team',
    description: 'Backend Development Team',
    isActive: true,
    createdDate: new Date('2024-01-01'),
    memberCount: 6,
    evaluatorId: 2,
    evaluatorName: 'Jane Smith',
  },
];

// MSW v2 handlers
export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/api/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Login successful',
      user: mockUsers[0],
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });
  }),

  http.post(`${API_BASE_URL}/api/auth/refresh`, () => {
    return HttpResponse.json({
      message: 'Token refreshed successfully',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
  }),

  http.get(`${API_BASE_URL}/api/auth/me`, () => {
    return HttpResponse.json(mockUsers[0]);
  }),

  http.post(`${API_BASE_URL}/api/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logout successful' });
  }),

  // User endpoints
  http.post(`${API_BASE_URL}/api/user/search`, () => {
    const searchResults: UserSearchDto[] = mockUsers.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      departmentName: user.departmentName,
      roleNames: user.roleNames,
      isActive: user.isActive,
    }));

    const response: PaginatedResponse<UserSearchDto> = {
      data: searchResults,
      totalCount: searchResults.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    return HttpResponse.json(response);
  }),

  http.get(`${API_BASE_URL}/api/user/:id`, ({ params }) => {
    const id = Number(params.id);
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(user);
  }),

  http.post(`${API_BASE_URL}/api/user`, () => {
    const newUser: UserDto = {
      id: mockUsers.length + 1,
      firstName: 'New',
      lastName: 'User',
      email: 'new.user@example.com',
      departmentId: 1,
      departmentName: 'Engineering',
      roleIds: [1],
      roleNames: ['Employee'],
      isActive: true,
      createdDate: new Date(),
      updatedDate: new Date(),
    };
    
    return HttpResponse.json(newUser);
  }),

  http.put(`${API_BASE_URL}/api/user/:id`, () => {
    return HttpResponse.json(mockUsers[0]);
  }),

  http.delete(`${API_BASE_URL}/api/user/:id`, () => {
    return HttpResponse.json({ message: 'User deleted successfully' });
  }),

  // Department endpoints
  http.get(`${API_BASE_URL}/api/department`, () => {
    return HttpResponse.json(mockDepartments);
  }),

  http.post(`${API_BASE_URL}/api/department`, () => {
    const newDepartment: DepartmentDto = {
      id: mockDepartments.length + 1,
      name: 'New Department',
      description: 'New Department Description',
      isActive: true,
      createdDate: new Date(),
      updatedDate: new Date(),
      userCount: 0,
    };
    
    return HttpResponse.json(newDepartment);
  }),

  // Role endpoints
  http.get(`${API_BASE_URL}/api/role`, () => {
    return HttpResponse.json(mockRoles);
  }),

  // Team endpoints
  http.get(`${API_BASE_URL}/api/team`, () => {
    return HttpResponse.json(mockTeams);
  }),

  http.post(`${API_BASE_URL}/api/team`, () => {
    const newTeam: TeamDto = {
      id: mockTeams.length + 1,
      name: 'New Team',
      description: 'New Team Description',
      isActive: true,
      createdDate: new Date(),
      memberCount: 0,
    };
    
    return HttpResponse.json(newTeam);
  }),

  // Criteria endpoints
  http.get(`${API_BASE_URL}/api/criteria`, () => {
    return HttpResponse.json(mockCriteria);
  }),

  http.post(`${API_BASE_URL}/api/criteria`, () => {
    const newCriteria: CriteriaDto = {
      id: mockCriteria.length + 1,
      categoryId: 1,
      name: 'New Criteria',
      baseDescription: 'New criteria description',
      categoryName: 'Technical Skills',
      categoryWeight: 20,
      isActive: true,
      createdDate: new Date(),
      roleDescriptions: [],
    };
    
    return HttpResponse.json(newCriteria);
  }),

  // Evaluation endpoints
  http.get(`${API_BASE_URL}/api/evaluation`, () => {
    const response: PaginatedResponse<EvaluationDto> = {
      data: mockEvaluations,
      totalCount: mockEvaluations.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    return HttpResponse.json(response);
  }),

  http.post(`${API_BASE_URL}/api/evaluation`, () => {
    const newEvaluation: EvaluationDto = {
      id: mockEvaluations.length + 1,
      evaluatorId: 1,
      evaluatorName: 'John Doe',
      employeeId: 2,
      employeeName: 'Jane Smith',
      departmentName: 'Engineering',
      period: 'Q1 2024',
      status: 'In Progress',
      totalScore: undefined,
      createdDate: new Date(),
      completedDate: undefined,
    };
    
    return HttpResponse.json(newEvaluation);
  }),

  // Audit endpoints
  http.post(`${API_BASE_URL}/api/audit/search`, () => {
    return HttpResponse.json({
      data: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  }),

  // Catch-all handler for unmatched requests
  http.all('*', () => {
    return new HttpResponse(null, { status: 404 });
  }),
];
