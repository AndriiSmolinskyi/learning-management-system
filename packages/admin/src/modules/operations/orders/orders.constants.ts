import {
	OrderStatus,
} from '../../../shared/types'

export const orderStatusOptions: Array<OrderStatus> = [
	OrderStatus.APPROVED,
	OrderStatus.CANCELED,
	OrderStatus.IN_PROGRESS,
]