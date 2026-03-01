import {
	IsNotEmpty,
	IsNumber,
	IsString,
	IsUUID,
} from 'class-validator'

export class CreateExpenseCategoryDto {
  @IsUUID()
  @IsNotEmpty()
	public budgetPlanId!: string

  @IsNumber()
  @IsNotEmpty()
  public budget!: number

  @IsString()
  @IsNotEmpty()
  public name!: string
}
