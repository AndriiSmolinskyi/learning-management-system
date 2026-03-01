import { ApiProperty, } from '@nestjs/swagger'
import {
	IsNotEmpty,
	IsBoolean,
	IsString,
	IsOptional,
	IsArray,
} from 'class-validator'

export class PortfolioUpdateDto {
	@ApiProperty({
		required:    false,
		description: 'Status value for activated/deactivated',
	},)
	@IsOptional()
	@IsBoolean()
	@IsNotEmpty()
	public isActivated?: boolean

	@ApiProperty({
		required:    false,
		description: 'Name value for change',
	},)
	@IsString()
	@IsOptional()
	@IsNotEmpty()
	public name?: string

	@ApiProperty({
		required:    false,
		description: 'Type value for change',

	},)
	@IsString()
	@IsOptional()
	@IsNotEmpty()
	public type?: string

	@ApiProperty({
		required:    false,
		description: 'Resident value for change',

	},)
	@IsString()
	@IsOptional()
	public resident?: string

	@ApiProperty({
		required:    false,
		description: 'Tax tax resident value for change',
	},)
	@IsOptional()
	@IsString()
	public taxResident?: string

	@ApiProperty({
		required:    false,
		description: 'Remaining documents IDs',
	},)
	@IsOptional()
	@IsArray()
	@IsString({
		each: true,
	},)
	public oldDocumentsIds?: Array<string>
}