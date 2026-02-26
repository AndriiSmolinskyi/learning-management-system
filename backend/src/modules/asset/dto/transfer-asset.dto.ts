/* eslint-disable no-mixed-spaces-and-tabs */
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator'
import { ApiProperty, } from '@nestjs/swagger'
import { AssetNamesType, } from '../asset.types'
import { Type, } from 'class-transformer'

class UserInfoDto {
  @ApiProperty({ description: 'User name who performs update', },)
  @IsString()
  @IsNotEmpty()
	public	name!: string

  @ApiProperty({ description: 'User email', required: false, },)
  @IsOptional()
  public email?: string | null

//   @ApiProperty({ description: 'Reason of update', },)
//   @IsString()
//   @IsNotEmpty()
//   public reason!: string
}

export class TransferAssetDto {
	@ApiProperty({
		required:    true,
		description: 'ID of the transfered asset',
	},)
	@IsString()
	@IsNotEmpty()
	public id!: string

	@IsNotEmpty({
		message: 'Asset name cannot be empty',
	},)
	@IsEnum(AssetNamesType,)
	public assetName!: AssetNamesType

	@ApiProperty({
		required:    true,
		description: 'ID of the related client',
	},)
	@IsString()
	@IsNotEmpty()
	public clientId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related portfolio',
	},)
	@IsString()
	@IsNotEmpty()
	public portfolioId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related entity',
	},)
	@IsString()
	@IsNotEmpty()
	public entityId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related bank',
	},)
	@IsString()
	@IsNotEmpty()
	public bankId!: string

	@ApiProperty({
		required:    true,
		description: 'ID of the related account',
	},)
	@IsString()
	@IsNotEmpty()
	public accountId!: string

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