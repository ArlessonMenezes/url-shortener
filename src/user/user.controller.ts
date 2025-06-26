import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ){};

  @Post('register')
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário criado com sucesso' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos ou email já cadastrado' 
  })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  };

  // Endpoint para teste de autenticação
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Busca um usuário por e-mail na base de dados' })
  @Get(':email')
  async getOneUser(@Query('email') email: string) {
    return this.userService.findUserByEmail(email)
  }
}
