import {
	RequestStatusType,
} from '../../../shared/types'

export const requestStatusOptions: Array<RequestStatusType> = [
	RequestStatusType.APPROVED,
	RequestStatusType.CANCELED,
	RequestStatusType.IN_PROGRESS,
	RequestStatusType.NOT_STARTED,
	RequestStatusType.SENT_TO_CLIENT,
	RequestStatusType.SIGNED,
]