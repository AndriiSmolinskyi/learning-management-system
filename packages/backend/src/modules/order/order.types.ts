import type { Order, OrderDraft, Portfolio,} from '@prisma/client'
import type { PaginationResult, } from '../../shared/types'

export type OrderWithCashValue = Order & {
  cashValue?: number
}

export type TOrderListRes = PaginationResult<OrderWithCashValue>
export type TOrderDraftListRes = PaginationResult<OrderDraft>

export enum SortOrderFields {
	ID = 'id',
	UPDATED_AT = 'updatedAt',
}

export enum OrderStatus {
  IN_PROGRESS = 'In progress',
  APPROVED = 'Approved',
  CANCELED = 'Canceled',
}

export type TExtendedOrder = Order & {
  portfolio: Portfolio
}

export type TOrderUnits = {
	units: number
}
