import { CurrencyDataList, } from '@prisma/client'
import {
	IsNotEmpty,
	IsNumber,
	IsString,
	IsUUID,
} from 'class-validator'

export class CreateBudgetDraftAllocationDto {
  @IsUUID()
  @IsNotEmpty()
	public accountId!: string

  @IsUUID()
  @IsNotEmpty()
  public budgetPlanDraftId!: string

  @IsNumber()
  @IsNotEmpty()

  public amount!: number

  @IsNumber()
  @IsNotEmpty()
  public budget!: number

  @IsString()
  @IsNotEmpty()
  public currency!: CurrencyDataList
}