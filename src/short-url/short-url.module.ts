import { Module } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ShortUrlController } from './short-url.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortUrl } from './entities/short-url.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShortUrl]),
  ],
  providers: [ShortUrlService],
  controllers: [ShortUrlController]
})
export class ShortUrlModule {}
