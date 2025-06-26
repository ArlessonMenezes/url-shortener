import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('deve criar e retornar um usuário (sem a senha)', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const dto = { email: 'test@example.com', password: '123456' };
      const result = await service.createUser(dto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockUserRepository.create).toHaveBeenCalledWith(dto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('deve lançar erro se o email já estiver cadastrado', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const dto = { email: 'test@example.com', password: '123456' };

      await expect(service.createUser(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findUserByEmail', () => {
    it('deve retornar um usuário pelo email', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      });

    const result = await service.findUserByEmail('test@example.com');

    expect(result).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      createdAt: mockUser.createdAt,
    });

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
  });

    it('deve lançar erro se o usuário não for encontrado', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findUserByEmail('notfound@example.com')).rejects.toThrow(NotFoundException);
    });
  });
});
