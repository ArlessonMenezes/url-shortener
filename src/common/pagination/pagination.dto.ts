import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, Min } from "class-validator";

export class PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0;
}