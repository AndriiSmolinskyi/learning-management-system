import {
	SortOrder,
	type IRequest,
} from '../../../../../../shared/types'
import type {
	TRequestListFilter,
} from './request-list.types'

export const sortRequestList = (list: Array<IRequest>, filter: TRequestListFilter,): Array<IRequest> => {
	const {
		sortBy, sortOrder,
	} = filter

	return [...list,].sort((a, b,) => {
		let compareValue = 0

		if (sortBy === 'updatedAt') {
			compareValue = new Date(a.updatedAt,).getTime() - new Date(b.updatedAt,).getTime()
		} else if (sortBy === 'id') {
			compareValue = a.id - b.id
		}

		return sortOrder === SortOrder.ASC ?
			compareValue :
			-compareValue
	},)
}