import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUrl } from "class-validator";

export class CreateShortUrlDto {
  @ApiProperty({
    description: 'Endereço da URL original que será encurtada',
    example: 'https://google.com',
  })
  @IsNotEmpty()
  @IsUrl()
  originalUrl: string;
}