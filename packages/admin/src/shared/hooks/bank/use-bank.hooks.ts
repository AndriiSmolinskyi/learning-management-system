import {
	queryKeys,
} from '../../constants'
import {
	bankService,
} from '../../../services/bank/bank.service'
import type {
	IBank,
} from '../../types'
import {
	useQuery,
	type UseQueryResult,
} from '@tanstack/react-query'
import type {
	TGetBanksBySourceProps,
} from '../../../services/bank/bank.types'
import {
	hasOnlyOneField,
} from '../../utils'

export type TGetBankListSourcesIds = {
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entityIds?: Array<string>
}

export const useGetBanksBySourceIds = (sourceIds: TGetBankListSourcesIds,):
	UseQueryResult<Array<IBank>> => {
	return useQuery({
		queryKey: [queryKeys.BANK_LIST, sourceIds,],
		queryFn:  async() => {
			return bankService.getBankListBySourceIds(sourceIds,)
		},
	},)
}

export const useBanksBySourceId = (props: TGetBanksBySourceProps,):
	UseQueryResult<Array<IBank>> => {
	return useQuery({
		queryKey: [queryKeys.BANK, props,],
		queryFn:  async() => {
			return bankService.getBanksBySourceId(props,)
		},
		enabled: hasOnlyOneField(props,),
	},)
}