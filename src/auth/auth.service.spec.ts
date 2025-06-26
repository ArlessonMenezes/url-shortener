import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
  };

  const userServiceMock = {
    findUserByEmail: jest.fn(),
  };

  const jwtServiceMock = {
    sign: jest.fn(),
  };

   beforeEach(() => {
    service = new AuthService(
      userServiceMock as unknown as UserService,
      jwtServiceMock as unknown as JwtService,
    );
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('deve retornar o usuário sem a senha se as credenciais estiverem corretas', async () => {
      userServiceMock.findUserByEmail.mockResolvedValue(mockUser);
     (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(mockUser.email, 'senha123');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      });
    });

    it('deve retornar null se o email não for encontrado', async () => {
      userServiceMock.findUserByEmail.mockRejectedValue(new NotFoundException());

      const result = await service.validateUser('notfound@example.com', 'senha123');

      expect(result).toBeNull();
    });

    it('deve retornar null se a senha for inválida', async () => {
      userServiceMock.findUserByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(mockUser.email, 'senhaErrada');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('deve retornar um token JWT válido', async () => {
      jwtServiceMock.sign.mockReturnValue('fake.jwt.token');

      const result = await service.login({
        id: mockUser.id,
        email: mockUser.email,
      });

      expect(result).toEqual({
        access_token: 'fake.jwt.token',
      });

      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
    });
  });
});
