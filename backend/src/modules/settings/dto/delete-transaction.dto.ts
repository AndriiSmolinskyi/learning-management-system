// dto/soft-delete-transaction-type.dto.ts
import { ApiProperty, } from '@nestjs/swagger'
import { IsString, } from 'class-validator'

export class SoftDeleteTransactionTypeDto {
	@ApiProperty({ required: true, description: 'Initiator user name for audit', },)
	@IsString()
	public userName: string

	@ApiProperty({ required: true, description: 'Initiator user role for audit', },)
	@IsString()
	public userRole: string
}
