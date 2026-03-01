import { ApiProperty,} from '@nestjs/swagger'
import type { TClientRes, } from '../client.types'
import {
	IsOptional,
	IsArray,
	IsBoolean,
	IsString,
} from 'class-validator'
import { Transform, } from 'class-transformer'

export type SortOrder = 'asc' | 'desc'

export class GetClientsDto {
	@ApiProperty({ required: false, default: ['createdAt',], },)
	public sortBy?: Array<keyof TClientRes>

	@ApiProperty({ required: false, default: ['asc',], },)
	public sortOrder?: Array<SortOrder>

  @ApiProperty({ name: 'search', required: false, },)
  @IsOptional()
  @IsString()
	public search?: string

	@ApiProperty({ required: false, },)
  public skip?: number

	@ApiProperty({ required: false, },)
	public take?: number

	@Transform(({ value, },) => {
		if (value === 'true' || value === true) {
			return true
		}
		if (value === 'false' || value === false) {
			return false
		}
		return undefined
	},)
	@IsBoolean()
	@IsOptional()
	@ApiProperty({ required: false,},)
	public isActivated?: boolean

	@Transform(({ value, },) => {
		if (value === 'true' || value === true) {
			return true
		}
		if (value === 'false' || value === false) {
			return false
		}
		return undefined
	},)
	@IsBoolean()
	@IsOptional()
	@ApiProperty({ required: false,},)
	public isDeactivated?: boolean

	@ApiProperty({
		required:    false,
		description: 'Total assets range value',
	},)
	@IsOptional()
	@IsArray()
	public range?: Array<string>
}
