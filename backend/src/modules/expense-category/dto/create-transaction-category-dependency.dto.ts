import {
	IsNotEmpty,
	IsUUID,
	IsNumber,
} from 'class-validator'

export class CreateTransactionCategoryDependencyDto {
  @IsUUID()
  @IsNotEmpty()
	public expenseCategoryId!: string

  @IsNumber()
  @IsNotEmpty()
  public transactionId!: number
}
