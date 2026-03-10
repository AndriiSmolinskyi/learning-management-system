import {
	OrderStatus,
} from '../../../../shared/types'
import {
	LabelColor,
} from '../../../../shared/components'

export const getoOrderStatus = (status?: OrderStatus,): LabelColor | undefined => {
	switch (status) {
	case OrderStatus.APPROVED:
		return LabelColor.GREEN
	case OrderStatus.CANCELED:
		return LabelColor.RED
	case OrderStatus.IN_PROGRESS:
		return LabelColor.YELLOW
	default:
		return undefined
	}
}