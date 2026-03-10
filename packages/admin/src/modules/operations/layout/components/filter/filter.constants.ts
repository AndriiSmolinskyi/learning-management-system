import type {
	IOptionType,
} from '../../../../../shared/types'
import {
	OrderStatus,
} from '../../../../../shared/types'
import {
	RequestStatusType,
} from '../../../../../shared/types'
import type {
	TOperationsOrderRequestOption,
	TOperationsOrderStatusOption,
} from './filter.store'

export const requestFilterTypeOptions: Array<IOptionType<TOperationsOrderRequestOption>> = [
	{
		label: RequestStatusType.NOT_STARTED,
		value: {
			id:   RequestStatusType.NOT_STARTED,
			name: RequestStatusType.NOT_STARTED,
		},
	},
	{
		label: RequestStatusType.IN_PROGRESS,
		value: {
			id:   RequestStatusType.IN_PROGRESS,
			name: RequestStatusType.IN_PROGRESS,
		},
	},
	{
		label: RequestStatusType.APPROVED,
		value: {
			id:   RequestStatusType.APPROVED,
			name: RequestStatusType.APPROVED,
		},
	},
	{
		label: RequestStatusType.CANCELED,
		value: {
			id:   RequestStatusType.CANCELED,
			name: RequestStatusType.CANCELED,
		},
	},
	{
		label: RequestStatusType.SENT_TO_CLIENT,
		value: {
			id:   RequestStatusType.SENT_TO_CLIENT,
			name: RequestStatusType.SENT_TO_CLIENT,
		},
	},
	{
		label: RequestStatusType.SIGNED,
		value: {
			id:   RequestStatusType.SIGNED,
			name: RequestStatusType.SIGNED,
		},
	},
]

export const orderTypeOptions: Array<IOptionType<TOperationsOrderStatusOption>> = [
	{
		label: OrderStatus.IN_PROGRESS,
		value: {
			id:   OrderStatus.IN_PROGRESS,
			name: OrderStatus.IN_PROGRESS,
		},
	},
	{
		label: OrderStatus.APPROVED,
		value: {
			id:   OrderStatus.APPROVED,
			name: OrderStatus.APPROVED,
		},
	},
	{
		label: OrderStatus.CANCELED,
		value: {
			id:   OrderStatus.CANCELED,
			name: OrderStatus.CANCELED,
		},
	},

]