import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { userService } from '../userService';
import { createMockUser } from '@/test/utils/test-utils';

describe('userService', () => {
  describe('searchUsers', () => {
    it('fetches users successfully', async () => {
      const mockUsers = [createMockUser(), createMockUser({ id: 2, firstName: 'Jane' })];
      
      server.use(
        http.post('/api/user/search', () => {
          return HttpResponse.json({
            data: mockUsers,
            totalCount: 2,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 1,
          });
        })
      );

      const result = await userService.searchUsers({ page: 1, pageSize: 10 });
      
      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.data[0].firstName).toBe('John');
      expect(result.data[1].firstName).toBe('Jane');
    });

    it('handles search parameters correctly', async () => {
      const searchSpy = jest.fn();
      
      server.use(
        http.post('/api/user/search', ({ request }) => {
          searchSpy(request.body);
          return HttpResponse.json({
            data: [],
            totalCount: 0,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 0,
          });
        })
      );

      await userService.searchUsers({
        searchTerm: 'john',
        departmentId: 1,
        isActive: true,
        page: 2,
        pageSize: 5,
      });

      expect(searchSpy).toHaveBeenCalledWith({
        searchTerm: 'john',
        departmentId: 1,
        isActive: true,
        page: 2,
        pageSize: 5,
      });
    });

    it('handles API errors', async () => {
      server.use(
        http.post('/api/user/search', () => {
          return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
        })
      );

      await expect(userService.searchUsers({})).rejects.toThrow();
    });
  });

  describe('getUserById', () => {
    it('fetches a single user successfully', async () => {
      const mockUser = createMockUser();
      
      server.use(
        http.get('/api/user/:id', ({ params }) => {
          const { id } = params;
          if (id === '1') {
            return HttpResponse.json(mockUser);
          }
          return HttpResponse.json({ message: 'User not found' }, { status: 404 });
        })
      );

      const result = await userService.getUserById(1);
      
      expect(result).toEqual(mockUser);
    });

    it('handles user not found', async () => {
      server.use(
        rest.get('/api/user/:id', (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({ message: 'User not found' }));
        })
      );

      await expect(userService.getUserById(999)).rejects.toThrow();
    });
  });

  describe('createUser', () => {
    it('creates a user successfully', async () => {
      const newUser = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        password: 'password123',
        departmentId: 1,
        roleIds: [1, 2],
        isActive: true,
      };

      const createdUser = { ...createMockUser(), ...newUser, id: 3 };
      
      server.use(
        rest.post('/api/user', (req, res, ctx) => {
          return res(ctx.status(201), ctx.json(createdUser));
        })
      );

      const result = await userService.createUser(newUser);
      
      expect(result).toEqual(createdUser);
    });
  });

  describe('updateUser', () => {
    it('updates a user successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
      };

      const updatedUser = { ...createMockUser(), ...updateData };
      
      server.use(
        rest.put('/api/user/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(updatedUser));
        })
      );

      const result = await userService.updateUser(1, updateData);
      
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('deletes a user successfully', async () => {
      server.use(
        rest.delete('/api/user/:id', (req, res, ctx) => {
          return res(ctx.status(204));
        })
      );

      await expect(userService.deleteUser(1)).resolves.not.toThrow();
    });
  });

  describe('activateUser', () => {
    it('activates a user successfully', async () => {
      const activatedUser = { ...createMockUser(), isActive: true };
      
      server.use(
        rest.put('/api/user/:id/activate', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(activatedUser));
        })
      );

      const result = await userService.activateUser(1);
      
      expect(result.isActive).toBe(true);
    });
  });

  describe('deactivateUser', () => {
    it('deactivates a user successfully', async () => {
      const deactivatedUser = { ...createMockUser(), isActive: false };
      
      server.use(
        rest.put('/api/user/:id/deactivate', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(deactivatedUser));
        })
      );

      const result = await userService.deactivateUser(1);
      
      expect(result.isActive).toBe(false);
    });
  });
});
