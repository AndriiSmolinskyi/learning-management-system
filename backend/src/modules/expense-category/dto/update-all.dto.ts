import {
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator'

export class UpdateAllCategoryDto {
	@IsUUID()
	@IsOptional()
	public id?: string

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