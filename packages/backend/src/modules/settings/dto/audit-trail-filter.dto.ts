import { ApiProperty, } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, IsBooleanString,} from 'class-validator'
import { TransactionTypeAuditType, } from '../settings.types'

export class AuditTrailFilterDto {
  @ApiProperty({ name: 'search', required: false, type: String, },)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
	public search?: string

	@ApiProperty({
		name:     'settingsType',
		required: false,
		isArray:  true,
		enum:     TransactionTypeAuditType,
	},)
	@IsOptional()
	@IsArray()
	@IsEnum(TransactionTypeAuditType, { each: true, },)
  public settingsType?: Array<TransactionTypeAuditType>

	@ApiProperty({ name: 'userName', required: false, isArray: true, type: String, },)
	@IsOptional()
	@IsArray()
	@IsString({ each: true, },)
	public userName?: Array<string>

		@ApiProperty({ name: 'editCards', required: false, type: String, description: `'true' | 'false'`, },)
	@IsOptional()
	@IsBooleanString()
	public editCards?: string
}
