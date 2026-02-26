/* eslint-disable no-mixed-spaces-and-tabs */

import {
	IsArray,
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsString,
	IsUUID,
	ArrayNotEmpty,
	IsOptional,
} from 'class-validator'
import { Type, } from 'class-transformer'

class BankAccountDto {
  @IsUUID()
	public bankId?: string

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(4,)
  @IsOptional()
  public accountIds?: Array<string>
}

export class UpdateBudgetPlanDto {
  @IsArray()
  @IsOptional()
  @Type(() => {
  	return BankAccountDto
  },)
	public bankAccounts?: Array<BankAccountDto>

  @IsBoolean()
  @IsOptional()
  public isActivated?: boolean

  @IsNumber()
  @IsOptional()
  public amount?: number

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public name?: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public clientId?: string
}
