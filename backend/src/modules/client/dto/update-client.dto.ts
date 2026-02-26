import {
	IsArray,
	IsEmail,
	IsOptional,
	IsString,
	MaxLength,
} from 'class-validator'

import { MAX_INPUT_LENGTH, } from '../../../shared/constants'

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH,)
	public firstName?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH,)
  public lastName?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH,)
  public residence?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH,)
  public country?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH,)
  public region?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH,)
  public city?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH,)
  public streetAddress?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH,)
  public buildingNumber?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH,)
  public postalCode?: string

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true, },)
  public emails?: Array<string>

  @IsOptional()
  @IsArray()
  @IsString({ each: true, },)
  public contacts?: Array<string>

  @IsOptional()
	@IsString()
  public comment?: string
}
