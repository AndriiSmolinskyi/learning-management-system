/* eslint-disable no-mixed-spaces-and-tabs */
import {
	IsArray,
	IsOptional,
	IsString,
	MaxLength,
} from 'class-validator'
import { MAX_INPUT_LENGTH, } from '../../../shared/constants'

export class UpdateDraftDto {
  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH, {
  	message: `First name must not exceed ${MAX_INPUT_LENGTH} characters.`,
  },)
	public firstName?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH, {
  	message: `Last name must not exceed ${MAX_INPUT_LENGTH} characters.`,
  },)
  public lastName?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH, {
  	message: `Residence must not exceed ${MAX_INPUT_LENGTH} characters.`,
  },)
  public residence?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH, {
  	message: `Country must not exceed ${MAX_INPUT_LENGTH} characters.`,
  },)
  public country?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH, {
  	message: `Region must not exceed ${MAX_INPUT_LENGTH} characters.`,
  },)
  public region?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH, {
  	message: `City must not exceed ${MAX_INPUT_LENGTH} characters.`,
  },)
  public city?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH, {
  	message: `Street address must not exceed ${MAX_INPUT_LENGTH} characters.`,
  },)
  public streetAddress?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH, {
  	message: `Building number must not exceed ${MAX_INPUT_LENGTH} characters.`,
  },)
  public buildingNumber?: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_INPUT_LENGTH, {
  	message: `Postal code must not exceed ${MAX_INPUT_LENGTH} characters.`,
  },)
  public postalCode?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true, },)
  public emails?: Array<string>

  @IsOptional()
  @IsArray()
  @IsString({ each: true, },)
  public contacts?: Array<string>
}
