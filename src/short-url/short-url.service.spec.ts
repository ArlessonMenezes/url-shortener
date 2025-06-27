import { ShortUrlService } from './short-url.service';
import { IsNull, Repository } from 'typeorm';
import { ShortUrl } from './entities/short-url.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { NotFoundException } from '@nestjs/common';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'abc123'),
}));

describe('ShortUrlService', () => {
  let service: ShortUrlService;
  let repo: Repository<ShortUrl>;

  const mockShortUrlRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortUrlService,
        {
          provide: getRepositoryToken(ShortUrl),
          useValue: mockShortUrlRepository,
        },
      ],
    }).compile();

    service = module.get<ShortUrlService>(ShortUrlService);
    repo = module.get<Repository<ShortUrl>>(getRepositoryToken(ShortUrl));

    jest.clearAllMocks();
    process.env.BASE_SHORT_URL = 'http://localhost';
  });

  describe('shortenUrl', () => {
    it('deve criar e retornar uma URL encurtada', async () => {
      const dto = { originalUrl: 'https://example.com' };
      const user = { id: 1 };

      const createdEntity = {
        id: 1,
        shortCode: 'abc123',
        originalUrl: dto.originalUrl,
        user,
      };

      mockShortUrlRepository.create.mockReturnValue(createdEntity);
      mockShortUrlRepository.save.mockResolvedValue(createdEntity);

      const result = await service.shortenUrl(dto, user);

      expect(nanoid).toHaveBeenCalledWith(6);
      expect(mockShortUrlRepository.create).toHaveBeenCalledWith({
        shortCode: 'abc123',
        originalUrl: dto.originalUrl,
        user,
      });
      expect(mockShortUrlRepository.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toBe('http://localhost/abc123');
    });
  });

  describe('getUserUrls', () => {
    it('deve retornar urls e metadados com paginação', async () => {
      const mockUrls = [
        {
          id: 1,
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          clickCount: 5,
          user: { id: 1 } as any,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 2,
          shortCode: 'xyz456',
          originalUrl: 'https://example.org',
          clickCount: 3,
          user: { id: 1 } as any,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ]
      const total = 10;

      const paginationDto = { limit: 2, offset: 0 };

      jest.spyOn(repo, 'findAndCount').mockResolvedValue([mockUrls, total]);

      const result = await service.getUserUrls(1, paginationDto);

      expect(repo.findAndCount).toHaveBeenCalledWith({
        where: {
          user: { id: 1 },
          deletedAt: IsNull(),
        },
        take: 2,
        skip: 0,
        order: { createdAt: 'DESC' },
      });

      expect(result).toEqual({
        data: mockUrls,
        meta: {
          total,
          limit: 2,
          offset: 0,
          hasNextPage: true,
        },
      });
    });
  });

  describe('getOriginalUrl', () => {
    it('deve retornar a URL original e atualizar o contador de cliques', async () => {
      const mockUrl = {
        id: 1,
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        deletedAt: null,
      };

      mockShortUrlRepository.findOne.mockResolvedValue(mockUrl);
      mockShortUrlRepository.update = jest.fn().mockResolvedValue(undefined);

      const result = await service.getOriginalUrl('abc123');

      expect(mockShortUrlRepository.findOne).toHaveBeenCalledWith({
        where: {
          shortCode: 'abc123',
          deletedAt: IsNull(),
        },
      });

      expect(mockShortUrlRepository.update).toHaveBeenCalledWith(1, {
        clickCount: expect.any(Function), // pois clickCount é função
      });

      expect(result).toBe('https://example.com');
    });

    it('deve lançar NotFoundException se URL não for encontrada', async () => {
      mockShortUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.getOriginalUrl('inexistente')).rejects.toThrow(NotFoundException);

      expect(mockShortUrlRepository.findOne).toHaveBeenCalledWith({
        where: {
          shortCode: 'inexistente',
          deletedAt: IsNull(),
        },
      });

      expect(mockShortUrlRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('updateShortUrl', () => {
    it('deve atualizar a URL original e retornar o objeto atualizado', async () => {
      const id = 1;
      const userId = 1;
      const updateDto = { originalUrl: 'https://updated-url.com' };

      const mockShortUrl = {
        id,
        originalUrl: 'https://old-url.com',
        user: { id: userId },
        deletedAt: null,
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      };

      mockShortUrlRepository.findOne.mockResolvedValue(mockShortUrl);
      mockShortUrlRepository.save.mockImplementation(async (entity) => entity);

      const result = await service.updateShortUrl(id, userId, updateDto);

      expect(mockShortUrlRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          user: { id: userId },
          deletedAt: IsNull(),
        },
      });

      expect(mockShortUrlRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id,
        originalUrl: updateDto.originalUrl,
        user: { id: userId },
      }));

      expect(result.originalUrl).toBe(updateDto.originalUrl);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('deve lançar NotFoundException se a URL não for encontrada ou não pertencer ao usuário', async () => {
      mockShortUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.updateShortUrl(1, 1, { originalUrl: 'https://x.com' }))
        .rejects.toThrow(NotFoundException);

      expect(mockShortUrlRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteShortUrl', () => {
    it('deve marcar a URL como excluída logicamente e retornar mensagem de sucesso', async () => {
      const id = 1;
      const userId = 1;

      const mockShortUrl = {
        id,
        user: { id: userId },
        deletedAt: null,
        save: jest.fn(),
      };

      mockShortUrlRepository.findOne.mockResolvedValue(mockShortUrl);
      mockShortUrlRepository.save.mockImplementation(async (entity) => entity);

      const result = await service.deleteShortUrl(id, userId);

      expect(mockShortUrlRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          user: { id: userId },
          deletedAt: IsNull(),
        },
      });

      expect(mockShortUrl.deletedAt).toBeInstanceOf(Date);
      expect(mockShortUrlRepository.save).toHaveBeenCalledWith(mockShortUrl);
      expect(result).toEqual({ message: 'URL exluída com sucesso' });
    });

    it('deve lançar NotFoundException se a URL não existir ou já tiver sido excluída', async () => {
      mockShortUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteShortUrl(1, 1)).rejects.toThrow(NotFoundException);

      expect(mockShortUrlRepository.save).not.toHaveBeenCalled();
    });
  });
});
