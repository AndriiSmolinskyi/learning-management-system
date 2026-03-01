import { ApiPropertyOptional, } from '@nestjs/swagger'
import { IsUUID, IsOptional, } from 'class-validator'

export class GetBondsEquityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
	public clientId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  public portfolioId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  public entityId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  public bankId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  public accountId?: string
}
