import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { ShortUrl } from './entities/short-url.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { nanoid } from 'nanoid';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { UpdateShortUrlDto } from './dtos/update-short-url.dto';
import { CreateShortUrlDto } from './dtos/create-short-url.dto';

@Injectable()
export class ShortUrlService {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepository: Repository<ShortUrl>
  ){}

  async shortenUrl(
    createShortUrlDto: CreateShortUrlDto,
    user?: Partial<User> | undefined,
  )
  {
    const shortCode = nanoid(6);
    
    const shortUrl = this.shortUrlRepository.create({
      shortCode,
      originalUrl: createShortUrlDto.originalUrl,
      user,
    });

    await this.shortUrlRepository.save(shortUrl);

    return `${ process.env.BASE_SHORT_URL }/${ shortCode }`;
  };

  async getUserUrls(userId: number, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    
    const [ urls, total ] = await this.shortUrlRepository.findAndCount({
      where: {
        user: { id: userId },
        deletedAt: IsNull(),
      },
      take: paginationDto.limit,
      skip: paginationDto.offset,
      order: { createdAt: 'DESC' },
    });

    return {
      data: urls,
      meta: {
        total,
        limit,
        offset,
        hasNextPage: total > offset + limit,
      },
    };
  };

  async getOriginalUrl(shortCode: string) {
    const url = await this.shortUrlRepository.findOne({
      where: {
        shortCode,
        deletedAt: IsNull(),
      },
    });

    if (!url) throw new NotFoundException('URL não encontrada');

    await this.shortUrlRepository.update(url.id, {
      clickCount: () =>  'clickCount + 1'
    });

    return url.originalUrl;
  };

  async updateShortUrl(
    id: number,
    userId: number,
    updateShortUrl: UpdateShortUrlDto,
  )
  {
    const shortUrl = await this.shortUrlRepository.findOne({
      where: {
        id,
        user: { id: userId },
        deletedAt: IsNull(),
      },
    });

    if (!shortUrl) {
      throw new NotFoundException('URL não encontrada ou não pertence ao usuário');
    };

    shortUrl.originalUrl = updateShortUrl.originalUrl;
    shortUrl.updatedAt = new Date();

    await this.shortUrlRepository.save(shortUrl);

    return shortUrl;
  }

  async deleteShortUrl(id: number, userId: number) {
    const shortUrl = await this.shortUrlRepository.findOne({
      where: {
        id,
        user: { id: userId },
        deletedAt: IsNull(),
      },
    });

    if (!shortUrl) {
      throw new NotFoundException('URL não econtrada ou já foi excluida');
    };

    shortUrl.deletedAt = new Date(),
    await this.shortUrlRepository.save(shortUrl);

    return { message: 'URL exluída com sucesso' };
  }
}
