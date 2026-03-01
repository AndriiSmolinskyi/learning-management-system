/* eslint-disable no-mixed-spaces-and-tabs */
import { ApiProperty, } from '@nestjs/swagger'
import {
	IsOptional,
	IsString,
	IsArray,
	IsUUID,
	IsNotEmpty,
} from 'class-validator'

export class GetBudgetsFilteredDto {
  @ApiProperty({
  	required:    false,
  	description: 'IDs of the related clients',
  },)
	@IsOptional()
	@IsArray()
	@IsUUID(4, {
		each: true,
	},)
	public clientIds?: Array<string>

 	@ApiProperty({
 	name:        'search',
 	required:    false,
 	},)
	@IsOptional()
	@IsString()
	@IsNotEmpty()
  public search?: string

  @IsString()
  @IsOptional()
 	public isActivated?: string
}
