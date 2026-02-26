/* eslint-disable no-mixed-spaces-and-tabs */

import {
	IsArray,
	IsBoolean,
	IsNotEmpty,
	IsString,
	IsUUID,
	ValidateNested,
	ArrayNotEmpty,
	IsOptional,
} from 'class-validator'
import { Type, } from 'class-transformer'

class BankAccountDto {
  @IsUUID()
	public bankId!: string

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(4, { each: true, },)
  public accountIds!: Array<string>
}

export class CreateBudgetPlanDto {
  @IsUUID()
  @IsNotEmpty()
	public clientId: string

  @IsArray()
  @ValidateNested({ each: true, },)
  @Type(() => {
  	return BankAccountDto
  },)
  public bankAccounts!: Array<BankAccountDto>

  @IsBoolean()
  @IsOptional()
  	public isActivated?: boolean

  @IsString()
  @IsNotEmpty()
  	public name!: string
}
