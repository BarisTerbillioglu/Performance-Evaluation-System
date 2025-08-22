import { rest } from 'msw';
import { 
  UserSearchDto, 
  DepartmentDto, 
  RoleDto, 
  TeamWithMembersDto,
  CriteriaDto,
  EvaluationDto,
  PaginatedResponse 
} from '@/types';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Mock data
const mockUsers: UserSearchDto[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    departmentName: 'Engineering',
    isActive: true,
    roleNames: ['Developer', 'Team Lead'],
    lastLoginDate: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    departmentName: 'Marketing',
    isActive: true,
    roleNames: ['Marketing Manager'],
    lastLoginDate: '2024-01-14T15:45:00Z',
  },
];

const mockDepartments: DepartmentDto[] = [
  { id: 1, name: 'Engineering', description: 'Software Engineering Department' },
  { id: 2, name: 'Marketing', description: 'Marketing Department' },
  { id: 3, name: 'Sales', description: 'Sales Department' },
];

const mockRoles: RoleDto[] = [
  { id: 1, name: 'Developer', description: 'Software Developer' },
  { id: 2, name: 'Team Lead', description: 'Team Leader' },
  { id: 3, name: 'Manager', description: 'Department Manager' },
];

const mockTeams: TeamWithMembersDto[] = [
  {
    id: 1,
    name: 'Frontend Team',
    description: 'Frontend Development Team',
    departmentId: 1,
    departmentName: 'Engineering',
    parentTeamId: null,
    parentTeamName: null,
    memberCount: 5,
    evaluatorCount: 2,
    isActive: true,
    createdDate: '2024-01-01T00:00:00Z',
    updatedDate: '2024-01-15T00:00:00Z',
  },
];

const mockCriteria: CriteriaDto[] = [
  {
    id: 1,
    name: 'Code Quality',
    description: 'Quality of code written',
    categoryId: 1,
    categoryName: 'Technical Skills',
    weight: 25,
    isActive: true,
    createdDate: '2024-01-01T00:00:00Z',
    updatedDate: '2024-01-15T00:00:00Z',
  },
];

const mockEvaluations: EvaluationDto[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'John Doe',
    evaluatorId: 2,
    evaluatorName: 'Jane Smith',
    period: 'Q1 2024',
    status: 'completed',
    totalScore: 85,
    createdDate: '2024-01-01T00:00:00Z',
    updatedDate: '2024-01-15T00:00:00Z',
  },
];

// Helper function to create paginated response
const createPaginatedResponse = <T>(data: T[]): PaginatedResponse<T> => ({
  data,
  totalCount: data.length,
  pageNumber: 1,
  pageSize: 10,
  totalPages: Math.ceil(data.length / 10),
});

// API Handlers
export const handlers = [
  // Auth endpoints
  rest.post(`${API_BASE_URL}/api/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUsers[0],
      })
    );
  }),

  rest.post(`${API_BASE_URL}/api/auth/refresh`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token',
      })
    );
  }),

  // User endpoints
  rest.post(`${API_BASE_URL}/api/user/search`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(createPaginatedResponse(mockUsers))
    );
  }),

  rest.get(`${API_BASE_URL}/api/user/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const user = mockUsers.find(u => u.id === Number(id));
    
    if (!user) {
      return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    }
    
    return res(ctx.status(200), ctx.json(user));
  }),

  rest.post(`${API_BASE_URL}/api/user`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ ...mockUsers[0], id: Date.now() })
    );
  }),

  rest.put(`${API_BASE_URL}/api/user/:id`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockUsers[0]));
  }),

  rest.delete(`${API_BASE_URL}/api/user/:id`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // Department endpoints
  rest.get(`${API_BASE_URL}/api/department`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockDepartments));
  }),

  rest.post(`${API_BASE_URL}/api/department`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ ...mockDepartments[0], id: Date.now() })
    );
  }),

  // Role endpoints
  rest.get(`${API_BASE_URL}/api/role`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockRoles));
  }),

  // Team endpoints
  rest.get(`${API_BASE_URL}/api/team`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockTeams));
  }),

  rest.post(`${API_BASE_URL}/api/team`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ ...mockTeams[0], id: Date.now() })
    );
  }),

  // Criteria endpoints
  rest.get(`${API_BASE_URL}/api/criteria`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockCriteria));
  }),

  rest.post(`${API_BASE_URL}/api/criteria`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ ...mockCriteria[0], id: Date.now() })
    );
  }),

  // Evaluation endpoints
  rest.get(`${API_BASE_URL}/api/evaluation`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockEvaluations));
  }),

  rest.post(`${API_BASE_URL}/api/evaluation`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ ...mockEvaluations[0], id: Date.now() })
    );
  }),

  // Audit endpoints
  rest.post(`${API_BASE_URL}/api/audit/search`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(createPaginatedResponse([
        {
          id: 1,
          userId: 1,
          userName: 'John Doe',
          action: 'CREATE',
          entityType: 'USER',
          entityId: 1,
          entityName: 'John Doe',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          timestamp: '2024-01-15T10:30:00Z',
          details: 'User created',
        },
      ]))
    );
  }),

  // Fallback handler
  rest.all('*', (req, res, ctx) => {
    console.warn(`No handler found for ${req.method} ${req.url}`);
    return res(ctx.status(404), ctx.json({ message: 'Not found' }));
  }),
];
