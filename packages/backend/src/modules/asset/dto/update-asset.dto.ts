/* eslint-disable no-mixed-spaces-and-tabs */
import {
	IsNotEmpty,
	IsString,
	MaxLength,
	IsJSON,
	IsOptional,
	IsBoolean,
	ValidateNested,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'

import { MAX_INPUT_LENGTH, } from '../../../shared/constants'
import { Type, } from 'class-transformer'

class UserInfoDto {
  @ApiProperty({ description: 'User name who performs update', },)
  @IsString()
  @IsNotEmpty()
	public	name!: string

  @ApiProperty({ description: 'User email', required: false, },)
  @IsOptional()
  public email?: string | null

  @ApiProperty({ description: 'Reason of update', },)
  @IsString()
  @IsNotEmpty()
  public reason!: string
}

export class UpdateAssetDto {
	@ApiProperty({
		required:    false,
		description: 'Asset name',
	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Asset name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public assetName: string

	@ApiProperty({
		required:    false,
		description: 'Asset variable form payload',
	},)
	@IsOptional()
	@IsJSON()
	public payload: string

	@ApiProperty({
		required:    false,
		description: 'Update asset version instead of main asset',
	},)
	@IsOptional()
	@IsBoolean()
	public isVersion?: boolean

	@ApiProperty({
		required:    true,
		description: 'Information about user who made the update',
	},)
  @ValidateNested()
  @Type(() => {
  	return UserInfoDto
  },)
	public  	userInfo!: UserInfoDto
}

