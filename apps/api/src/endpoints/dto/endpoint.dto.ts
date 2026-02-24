import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import {
  AUTH_TYPES,
  AuthType,
  HTTP_METHODS,
  HttpMethod,
} from '../../common/constants/catalog.constants';

enum EndpointSortBy {
  path = 'path',
  createdAt = 'createdAt',
  method = 'method',
}

enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

export class CreateEndpointDto {
  @ApiProperty({ enum: HTTP_METHODS })
  @IsIn(HTTP_METHODS)
  method!: HttpMethod;

  @ApiProperty({ example: '/api/v1/orders' })
  @IsString()
  @MinLength(2)
  @Matches(/^\//, { message: 'path must start with /' })
  path!: string;

  @ApiProperty({ example: 'v1' })
  @IsString()
  @MinLength(1)
  version!: string;

  @ApiProperty({ minimum: 50, maximum: 10000 })
  @Type(() => Number)
  @IsInt()
  @Min(50)
  @Max(10000)
  slaMs!: number;

  @ApiProperty({ enum: AUTH_TYPES })
  @IsIn(AUTH_TYPES)
  authType!: AuthType;
}

export class UpdateEndpointDto {
  @ApiPropertyOptional({ enum: HTTP_METHODS })
  @IsOptional()
  @IsIn(HTTP_METHODS)
  method?: HttpMethod;

  @ApiPropertyOptional({ example: '/api/v1/orders' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @Matches(/^\//, { message: 'path must start with /' })
  path?: string;

  @ApiPropertyOptional({ example: 'v1' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  version?: string;

  @ApiPropertyOptional({ minimum: 50, maximum: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(50)
  @Max(10000)
  slaMs?: number;

  @ApiPropertyOptional({ enum: AUTH_TYPES })
  @IsOptional()
  @IsIn(AUTH_TYPES)
  authType?: AuthType;
}

export class ListEndpointsQueryDto {
  @ApiPropertyOptional({ enum: ['path', 'createdAt', 'method'] })
  @IsOptional()
  @IsIn(Object.values(EndpointSortBy))
  sortBy?: 'path' | 'createdAt' | 'method';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(Object.values(SortOrder))
  sortOrder?: 'asc' | 'desc';
}
