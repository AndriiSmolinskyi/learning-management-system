import {
	IsArray,
	IsNotEmpty,
	IsString,
	IsUUID,
} from 'class-validator'

export class LinkTransactionTypeToExpenseCategoryDto {
  @IsUUID()
  @IsNotEmpty()
	public expenseCategoryId!: string

  @IsArray()
  @IsString({each: true, },)
  public transactionTypes!: Array<string>
}
