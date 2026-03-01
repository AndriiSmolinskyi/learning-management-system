import { ApiProperty, } from '@nestjs/swagger'
import { Transform, } from 'class-transformer'
import { IsBoolean,} from 'class-validator'

export class CheckDto {
	@ApiProperty({
		required:    true,
		description: 'Is deactivated client allowed',
	},)
	@Transform(({ value, },) => {
		return value === 'true' || value === true
	},)
   @IsBoolean()
	public isDeactivatedClientAllowed?: boolean
}