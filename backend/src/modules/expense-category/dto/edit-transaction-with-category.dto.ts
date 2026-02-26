import {
	IsNotEmpty,
	IsNumber,
	IsUUID,
} from 'class-validator'

export class EditLinkTransactionWithCategoryDto {
  @IsUUID()
  @IsNotEmpty()
	public expenseCategoryId!: string

  @IsUUID()
  @IsNotEmpty()
  public prevExpenseCategoryId!: string

  @IsNotEmpty()
  @IsNumber()
  public transactionId!: number
}
