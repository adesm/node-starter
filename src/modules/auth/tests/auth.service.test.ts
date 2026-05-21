import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { AuthService } from '../auth.service';
import { AuthRepository } from '../auth.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../auth.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let authRepositoryMock: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    authRepositoryMock = new AuthRepository() as jest.Mocked<AuthRepository>;
    authService = new AuthService(authRepositoryMock); // Pass mock directly via DI
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginInput = { identifier: 'john_doe_or_nip', password: 'password123' };
    const mockUser = {
      id: 'uuid-1234',
      username: 'john_doe',
      nip: '123456789',
      password: 'hashedpassword',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully log in a user and return token', async () => {
      authRepositoryMock.findUserByIdentifier.mockResolvedValue(mockUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never); // Cast to resolve Jest's strict overload resolution
      jest.mocked(jwt.sign).mockReturnValue('mocked-jwt-token' as any);

      const result = await authService.login(loginInput);

      expect(authRepositoryMock.findUserByIdentifier).toHaveBeenCalledWith(loginInput.identifier);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginInput.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalled();
      
      expect(result).toHaveProperty('token', 'mocked-jwt-token');
      expect(result.user).toHaveProperty('id', mockUser.id);
      expect(result.user).toHaveProperty('username', mockUser.username);
      expect(result.user).toHaveProperty('nip', mockUser.nip);
    });

    it('should throw error for invalid identifier', async () => {
      authRepositoryMock.findUserByIdentifier.mockResolvedValue(null);

      await expect(authService.login(loginInput)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      authRepositoryMock.findUserByIdentifier.mockResolvedValue(mockUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(authService.login(loginInput)).rejects.toThrow('Invalid credentials');
    });
  });
});
