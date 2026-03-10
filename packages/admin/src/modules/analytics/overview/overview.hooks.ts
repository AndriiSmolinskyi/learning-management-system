/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import React from 'react'

import type {
	TOverviewProps,
} from '../../../services/analytics/analytics.types'
import type {
	TOverviewFilter,
} from './overview.types'
import type {
	TAnalyticsStoreFilter,
} from '../analytics-store'
import {
	useDebounce,
} from '../../../shared/hooks'

type CombinedFilterProps = {
	filter: TOverviewFilter
	analyticsFilter: TAnalyticsStoreFilter
}

export const useAssetCombinedFilter = ({
	filter,
	analyticsFilter,
}: CombinedFilterProps,): TOverviewProps => {
	const filterResult = React.useMemo(() => {
		const filteredCurrencies = filter.pieCurrencies ?
			filter.tableCurrencies ?
				filter.pieCurrencies.filter((item,) => {
					return filter.tableCurrencies?.includes(item,)
				},) :
				filter.pieCurrencies :
			filter.tableCurrencies

		const filteredLocalBankIds = filter.tableAccountIds ?
			undefined :
			filter.pieBankIds ?
				filter.tableBankIds ?
					filter.pieBankIds.filter((item,) => {
						return filter.tableBankIds?.includes(item,)
					},) :
					filter.pieBankIds :
				filter.tableBankIds
		const filteredBankIds = filteredLocalBankIds ?
			analyticsFilter.bankIds ?
				filteredLocalBankIds.filter((item,) => {
					return analyticsFilter.bankIds?.map((item,) => {
						return item.value.id
					},).includes(item,)
				},) :
				filteredLocalBankIds :
			analyticsFilter.bankIds?.map((item,) => {
				return item.value.id
			},)

		const filteredLocalEntityIds = filter.pieEntityIds ?
			filter.tableEntityIds ?
				filter.pieEntityIds.filter((item,) => {
					return filter.tableEntityIds?.includes(item,)
				},) :
				filter.pieEntityIds :
			filter.tableEntityIds
		const filteredEntityIds = filteredLocalEntityIds ?
			analyticsFilter.entitiesIds ?
				filteredLocalEntityIds.filter((item,) => {
					return analyticsFilter.entitiesIds?.map((item,) => {
						return item.value.id
					},).includes(item,)
				},) :
				filteredLocalEntityIds :
			analyticsFilter.entitiesIds?.map((item,) => {
				return item.value.id
			},)

		const globalAccountIds = analyticsFilter.accountIds?.map((account,) => {
			return account.value.id
		},)
		const combinedAccountIds = filter.tableAccountIds ?
			globalAccountIds ?
				globalAccountIds.filter((accountId,) => {
					return filter.tableAccountIds?.includes(accountId,)
				},) :
				filter.tableAccountIds :
			globalAccountIds

		return {
			clientIds: analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds: analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			accountIds:  combinedAccountIds,
			date:        analyticsFilter.date,
			bankListIds: filteredBankIds,
			currencies:  filteredCurrencies,
			entityIds:   filteredEntityIds,
		}
	}, [analyticsFilter, filter,],)

	return useDebounce(filterResult, 200,)
}

export const useBankCombinedFilter = ({
	filter,
	analyticsFilter,
}: CombinedFilterProps,): TOverviewProps => {
	const filterResult = React.useMemo(() => {
		const filteredCurrencies = filter.pieCurrencies ?
			filter.tableCurrencies ?
				filter.pieCurrencies.filter((item,) => {
					return filter.tableCurrencies?.includes(item,)
				},) :
				filter.pieCurrencies :
			filter.tableCurrencies

		const filteredLocalEntityIds = filter.pieEntityIds ?
			filter.tableEntityIds ?
				filter.pieEntityIds.filter((item,) => {
					return filter.tableEntityIds?.includes(item,)
				},) :
				filter.pieEntityIds :
			filter.tableEntityIds
		const filteredEntityIds = filteredLocalEntityIds ?
			analyticsFilter.entitiesIds ?
				filteredLocalEntityIds.filter((item,) => {
					return analyticsFilter.entitiesIds?.map((item,) => {
						return item.value.id
					},).includes(item,)
				},) :
				filteredLocalEntityIds :
			analyticsFilter.entitiesIds?.map((item,) => {
				return item.value.id
			},)

		const filteredAssetNames = filter.pieAssetNames ?
			filter.tableAssetNames ?
				filter.pieAssetNames.filter((item,) => {
					return filter.tableAssetNames?.includes(item,)
				},) :
				filter.pieAssetNames :
			filter.tableAssetNames

		const globalAccountIds = analyticsFilter.accountIds?.map((account,) => {
			return account.value.id
		},)

		return {
			clientIds: analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds: analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			date:        analyticsFilter.date,
			currencies:  filteredCurrencies,
			entityIds:   filteredEntityIds,
			assetNames:  filteredAssetNames,
			// todo: clear if good
			// bankListIds: analyticsFilter.bankIds?.map((item,) => {
			// 	return item.value.id
			// },),
			bankListIds: filter.pieBankIds ??
				filter.tableBankIds ??
				analyticsFilter.bankIds?.map((item,) => {
					return item.value.id
				},),
			accountIds: globalAccountIds,
		}
	}, [analyticsFilter, filter,],)

	return useDebounce(filterResult, 200,)
}

export const useCurrencyCombinedFilter = ({
	filter,
	analyticsFilter,
}: CombinedFilterProps,): TOverviewProps => {
	const filterResult = React.useMemo(() => {
		const filteredLocalBankIds = filter.tableAccountIds ?
			undefined :
			filter.pieBankIds ?
				filter.tableBankIds ?
					filter.pieBankIds.filter((item,) => {
						return filter.tableBankIds?.includes(item,)
					},) :
					filter.pieBankIds :
				filter.tableBankIds
		const filteredBankIds = filteredLocalBankIds ?
			analyticsFilter.bankIds ?
				filteredLocalBankIds.filter((item,) => {
					return analyticsFilter.bankIds?.map((item,) => {
						return item.value.id
					},).includes(item,)
				},) :
				filteredLocalBankIds :
			analyticsFilter.bankIds?.map((item,) => {
				return item.value.id
			},)

		const filteredLocalEntityIds = filter.pieEntityIds ?
			filter.tableEntityIds ?
				filter.pieEntityIds.filter((item,) => {
					return filter.tableEntityIds?.includes(item,)
				},) :
				filter.pieEntityIds :
			filter.tableEntityIds
		const filteredEntityIds = filteredLocalEntityIds ?
			analyticsFilter.entitiesIds ?
				filteredLocalEntityIds.filter((item,) => {
					return analyticsFilter.entitiesIds?.map((item,) => {
						return item.value.id
					},).includes(item,)
				},) :
				filteredLocalEntityIds :
			analyticsFilter.entitiesIds?.map((item,) => {
				return item.value.id
			},)

		const filteredAssetNames = filter.pieAssetNames ?
			filter.tableAssetNames ?
				filter.pieAssetNames.filter((item,) => {
					return filter.tableAssetNames?.includes(item,)
				},) :
				filter.pieAssetNames :
			filter.tableAssetNames

		const globalAccountIds = analyticsFilter.accountIds?.map((account,) => {
			return account.value.id
		},)
		const combinedAccountIds = filter.tableAccountIds ?
			globalAccountIds ?
				globalAccountIds.filter((accountId,) => {
					return filter.tableAccountIds?.includes(accountId,)
				},) :
				filter.tableAccountIds :
			globalAccountIds

		return {
			clientIds: analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds: analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			date:        analyticsFilter.date,
			bankListIds: filteredBankIds,
			entityIds:   filteredEntityIds,
			assetNames:  filteredAssetNames,
			accountIds:  combinedAccountIds,
		}
	}, [analyticsFilter, filter,],)

	return useDebounce(filterResult, 200,)
}

export const useEntityCombinedFilter = ({
	filter,
	analyticsFilter,
}: CombinedFilterProps,): TOverviewProps => {
	const filterResult = React.useMemo(() => {
		const filteredCurrencies = filter.pieCurrencies ?
			filter.tableCurrencies ?
				filter.pieCurrencies.filter((item,) => {
					return filter.tableCurrencies?.includes(item,)
				},) :
				filter.pieCurrencies :
			filter.tableCurrencies

		const filteredLocalBankIds = filter.tableAccountIds ?
			undefined :
			filter.pieBankIds ?
				filter.tableBankIds ?
					filter.pieBankIds.filter((item,) => {
						return filter.tableBankIds?.includes(item,)
					},) :
					filter.pieBankIds :
				filter.tableBankIds
		const filteredBankIds = filteredLocalBankIds ?
			analyticsFilter.bankIds ?
				filteredLocalBankIds.filter((item,) => {
					return analyticsFilter.bankIds?.map((item,) => {
						return item.value.id
					},).includes(item,)
				},) :
				filteredLocalBankIds :
			analyticsFilter.bankIds?.map((item,) => {
				return item.value.id
			},)

		const filteredAssetNames = filter.pieAssetNames ?
			filter.tableAssetNames ?
				filter.pieAssetNames.filter((item,) => {
					return filter.tableAssetNames?.includes(item,)
				},) :
				filter.pieAssetNames :
			filter.tableAssetNames

		const globalAccountIds = analyticsFilter.accountIds?.map((account,) => {
			return account.value.id
		},)
		const combinedAccountIds = filter.tableAccountIds ?
			globalAccountIds ?
				globalAccountIds.filter((accountId,) => {
					return filter.tableAccountIds?.includes(accountId,)
				},) :
				filter.tableAccountIds :
			globalAccountIds

		return {
			clientIds: analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds: analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			date:        analyticsFilter.date,
			bankListIds: filteredBankIds,
			currencies:  filteredCurrencies,
			assetNames:  filteredAssetNames,
			entityIds:   analyticsFilter.entitiesIds?.map((item,) => {
				return item.value.id
			},),
			accountIds: combinedAccountIds,
		}
	}, [analyticsFilter, filter,],)

	return useDebounce(filterResult, 200,)
}