import { ApiProperty, } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID, } from 'class-validator'

export class ChangeRelationsDto {
  @ApiProperty({ required: false, description: 'Related type id (or null to clear)', },)
  @IsOptional()
  @IsUUID(4,)
	public relatedTypeId?: string | null

  @ApiProperty({ required: false, description: 'Asset (or null to clear)', },)
  @IsOptional()
  @IsString()
  public asset?: string | null

  @ApiProperty({ required: true, description: 'Initiator user name for audit', },)
  @IsString()
  public userName: string

  @ApiProperty({ required: true, description: 'Initiator user role for audit', },)
  @IsString()
  public userRole: string
}
