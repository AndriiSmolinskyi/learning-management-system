import type {
	IOptionType,
} from '../types'
import {
	RequestStatusType,
} from '../types'

export const requestTypeOptions: Array<IOptionType<RequestStatusType>> = [
	{
		label: RequestStatusType.NOT_STARTED,
		value: RequestStatusType.NOT_STARTED,
	},
	{
		label: RequestStatusType.IN_PROGRESS,
		value: RequestStatusType.IN_PROGRESS,
	},
	{
		label: RequestStatusType.APPROVED,
		value: RequestStatusType.APPROVED,
	},
	{
		label: RequestStatusType.CANCELED,
		value: RequestStatusType.CANCELED,
	},
	{
		label: RequestStatusType.SENT_TO_CLIENT,
		value: RequestStatusType.SENT_TO_CLIENT,
	},
	{
		label: RequestStatusType.SIGNED,
		value: RequestStatusType.SIGNED,
	},
]