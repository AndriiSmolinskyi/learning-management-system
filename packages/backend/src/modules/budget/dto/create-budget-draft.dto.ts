/* eslint-disable no-mixed-spaces-and-tabs */
import {
	IsArray,
	IsNotEmpty,
	IsString,
	IsUUID,
	IsOptional,
} from 'class-validator'

class BankAccountDto {
  @IsUUID()
	public bankId!: string

  @IsArray()
  @IsUUID()
  public accountIds!: Array<string>
}

export class CreateBudgetDraftDto {
  @IsUUID()
  @IsNotEmpty()
	public clientId: string

  @IsArray()
  @IsOptional()
  public bankAccounts?: Array<BankAccountDto>

  @IsString()
  @IsNotEmpty()
  public name!: string
}
