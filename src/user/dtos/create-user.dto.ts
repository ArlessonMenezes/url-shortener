import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email do usuário',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha com mínimo de 4 caracteres',
    minLength: 4,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;
}