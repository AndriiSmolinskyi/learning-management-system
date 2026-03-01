import { ApiProperty, } from '@nestjs/swagger'
import { IsBoolean, IsString, } from 'class-validator'

export class ChangeActivatedStatusDto {
  @ApiProperty({ required: true, description: 'New activation status', },)
  @IsBoolean()
	public activatedStatus: boolean

  @ApiProperty({ required: true, description: 'Initiator user name for audit', },)
  @IsString()
  public userName: string

  @ApiProperty({ required: true, description: 'Initiator user role for audit', },)
  @IsString()
  public userRole: string
}
