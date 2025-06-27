import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { CreateShortUrlDto } from './dtos/create-short-url.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateShortUrlDto } from './dtos/update-short-url.dto';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { OptionalAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';

@ApiTags('Short URLs')
@Controller('short-url')
export class ShortUrlController {
  constructor(
    private readonly shortUrlService: ShortUrlService,
  ) {}

  @Post('shorten')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Encurtar URL' })
  @ApiResponse({ status: 201, description: 'URL encurtada com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro de validação' })
  async shortenUrl(
    @Body() createShortUrlDto: CreateShortUrlDto,
    @Req() req: any,
  ) {
    const user = req.user ? { id: req.user.sub } : undefined;
    return this.shortUrlService.shortenUrl(createShortUrlDto, user);
  };

  @Get(':shortCode')
  @ApiOperation({ summary: 'Redirecionar para a URL original' })
  @ApiResponse({ status: 200, description: 'Redireciona para a URL original' })
  @ApiResponse({ status: 404, description: 'URL não encontrada' })
  async redirect(@Param('shortCode') shortCode: string) {
    const originalUrl = await this.shortUrlService.getOriginalUrl(shortCode);
    return { url: originalUrl };
  }

  @Get('user/urls')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar URLs do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de URLs do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getUserUrls(
    @Req() req: any,
    @Query() paginationDto: PaginationDto) {
    return this.shortUrlService.getUserUrls(req.user.id, paginationDto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar URL encurtada do usuário' })
  @ApiResponse({ status: 200, description: 'URL atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'URL não encontrada ou não pertence ao usuário' })
  async updateUrl(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() updateShortUrlDto: UpdateShortUrlDto,
  ) {
    return this.shortUrlService.updateShortUrl(id, req.user.id, updateShortUrlDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Excluir URL encurtada do usuário' })
  @ApiResponse({ status: 200, description: 'URL excluída com sucesso' })
  @ApiResponse({ status: 404, description: 'URL não encontrada ou não pertence ao usuário' })
  async deleteUrl(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.shortUrlService.deleteShortUrl(id, req.user.id);
  }
}
