/* eslint-disable complexity */
import type {
	IClientWithBudgetPlan,
} from '../../../../../services/client'
import {
	TClientSortVariants,
} from '../clients.types'
import type {
	TClientTableFilter,
} from '../clients.types'
import {
	SortOrder,
} from '../../../../../shared/types'

export const sortClientList = (list: Array<IClientWithBudgetPlan>, filter: TClientTableFilter,): Array<IClientWithBudgetPlan> => {
	const {
		sortBy, sortOrder,
	} = filter

	return [...list,].sort((a, b,) => {
		const compareActivated = (b.isActivated ?
			1 :
			0) - (a.isActivated ?
			1 :
			0)

		if (compareActivated !== 0) {
			return compareActivated
		}
		let compareValue = 0

		if (sortBy === TClientSortVariants.DATE) {
			compareValue = new Date(a.createdAt,).getTime() - new Date(b.createdAt,).getTime()
		} else if (sortBy === TClientSortVariants.TOTAL_ASSETS) {
			const totalAssetsA = Number(a.totalAssets,) || 0
			const totalAssetsB = Number(b.totalAssets,) || 0
			compareValue = totalAssetsA - totalAssetsB
		}
		if (sortBy === TClientSortVariants.NAME) {
			compareValue = a.firstName.localeCompare(b.firstName,)
		}
		return sortOrder === SortOrder.ASC ?
			compareValue :
			-compareValue
	},)
}
