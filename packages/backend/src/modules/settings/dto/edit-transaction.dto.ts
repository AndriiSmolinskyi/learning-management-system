import { PartialType, } from '@nestjs/swagger'
import { CreateTransactionTypeDto, } from './create-transaction.dto'

export class UpdateTransactionTypeDto extends PartialType(CreateTransactionTypeDto,) {}
