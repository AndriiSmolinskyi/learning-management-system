/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable complexity */
import {
	useLocation,
} from 'react-router-dom'
import {
	useAnalyticsFilterStore,
} from '../../../analytics-store'
import {
	RouterKeys,
} from '../../../../../router/keys'
import {
	useBondStore,
} from '../../../../analytics/bonds'
import {
	useCashStore,
} from '../../../../analytics/cash/cash.store'
import {
	useOverviewStore,
} from '../../../../analytics/overview/overview.store'
import {
	useDepositStore,
} from '../../../../analytics/deposit'
import {
	useOptionsStore,
} from '../../../../analytics/options'
import {
	useLoanStore,
} from '../../../../analytics/loan'
import {
	useEquityStore,
} from '../../../../analytics/equities'
import {
	useMetalsStore,
} from '../../../../analytics/metals'
import {
	usePrivateEquityStore,
} from '../../../../analytics/private-equity'
import {
	useCryptoStore,
} from '../../../../analytics/crypto'
import {
	useRealEstateStore,
} from '../../../../analytics/real-estate/real-estate.store'
import {
	useOtherInvestmentsStore,
} from '../../../../analytics/other-investments'
import {
	useAnalyticTransactionStore,
} from '../../../../analytics/transactions'

export const useGetFilterApplied = (): boolean => {
	const location = useLocation()
	const {
		analyticsFilter: storeFilter,
	} = useAnalyticsFilterStore()
	const {
		filter: transactionFilter,
	} = useAnalyticTransactionStore()
	// console.log(storeFilter,)

	const isFilterApplied = (location.pathname.includes(RouterKeys.ANALYTICS_BONDS,) && (
		storeFilter.bankIds?.length ??
		storeFilter.accountIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.isins?.length ??
		storeFilter.currencies?.length ??
		storeFilter.securities?.length ??
		storeFilter.tradeOperation ??
		storeFilter.date
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_CASH,) && (
		storeFilter.bankIds?.length ??
		storeFilter.accountIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.currencies?.length ??
		storeFilter.date
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_DEPOSIT,) && (
		storeFilter.accountIds?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.currencies?.length ??
		storeFilter.date
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_OPTIONS,) && (
		storeFilter.accountIds?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.pairs?.length ??
		storeFilter.date
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_LOAN,) && (
		storeFilter.accountIds?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.loanNames?.length ??
		storeFilter.currencies?.length ??
		storeFilter.date
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_EQUITIES,) && (
		storeFilter.accountIds?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.equityTypes?.length ??
		storeFilter.isins?.length ??
		storeFilter.securities?.length ??
		storeFilter.currencies?.length ??
		storeFilter.tradeOperation ??
		storeFilter.date
	))	|| (location.pathname.includes(RouterKeys.ANALYTICS_METALS,) && (
		storeFilter.accountIds?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.metals?.length ??
		storeFilter.equityTypes?.length ??
		storeFilter.isins?.length ??
		storeFilter.securities?.length ??
		storeFilter.currencies?.length ??
		storeFilter.metalProductTypes ??
		storeFilter.tradeOperation ??
		storeFilter.date
	))	|| (location.pathname.includes(RouterKeys.ANALYTICS_PRIVATE_EQUITY,) && (
		storeFilter.accountIds?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.privateEquityTypes?.length ??
		storeFilter.privateEquityNames?.length ??
		storeFilter.currencies?.length ??
		storeFilter.date
	))	|| (location.pathname.includes(RouterKeys.ANALYTICS_CRYPTO,) && (
		storeFilter.accountIds?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.cryptoTypes?.length ??
		storeFilter.productTypes ??
		storeFilter.wallets?.length ??
		storeFilter.equityTypes?.length ??
		storeFilter.isins?.length ??
		storeFilter.securities?.length ??
		storeFilter.currencies?.length ??
		storeFilter.tradeOperation ??
		storeFilter.date
	))	|| (location.pathname.includes(RouterKeys.ANALYTICS_REAL_ESTATE,) && (
		storeFilter.accountIds?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.operations?.length ??
		storeFilter.projectTransactions?.length ??
		storeFilter.countries?.length ??
		storeFilter.cities?.length ??
		storeFilter.date
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_OTHER_INVESTMENTS,) && (
		storeFilter.accountIds?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.currencies?.length ??
		storeFilter.serviceProviders?.length ??
		storeFilter.investmentAssetNames?.length ??
		storeFilter.cities?.length ??
		storeFilter.date
	))	|| (location.pathname.includes(RouterKeys.ANALYTICS_OVERVIEW,) && (
		storeFilter.accountIds?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.date
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_TRANSACTIONS,) && (
		storeFilter.accountIds?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.serviceProviders?.length ??
		storeFilter.currencies?.length ??
		transactionFilter.isins?.length ??
		transactionFilter.securities?.length ??
		transactionFilter.transactionTypes?.length ??
		storeFilter.date
	))

	return Boolean(isFilterApplied,)
}

export const useGetGlobalRefreshActivated = (): boolean => {
	const location = useLocation()

	const {
		filter: bondFilter,
	} = useBondStore()
	const {
		filter: cashStore,
	} = useCashStore()
	const {
		filter: overviewStore,
	} = useOverviewStore()
	const {
		filter: depositStore,
	} = useDepositStore()
	const {
		filter: optionStore,
	} = useOptionsStore()
	const {
		filter: loanStore,
	} = useLoanStore()
	const {
		filter: equityStore,
	} = useEquityStore()
	const {
		filter: metalStore,
	} = useMetalsStore()
	const {
		filter: privateEquityStore,
	} = usePrivateEquityStore()
	const {
		filter: cryptoStore,
	} = useCryptoStore()
	const {
		filter: realEstateStore,
	} = useRealEstateStore()
	const {
		filter: otherInvestmentsStore,
	} = useOtherInvestmentsStore()
	const {
		filter: transactionStore,
	} = useAnalyticTransactionStore()
	const {
		analyticsFilter: storeFilter,
	} = useAnalyticsFilterStore()

	const isFilterApplied = (location.pathname.includes(RouterKeys.ANALYTICS_BONDS,) && (
		bondFilter.assetId?.length ??
		bondFilter.bankId?.length ??
		bondFilter.currency?.length
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_CASH,) && (
		cashStore.bankId?.length ??
		cashStore.currency?.length ??
		cashStore.entityId?.length
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_DEPOSIT,) && (
		depositStore.assetId?.length ??
		depositStore.bankId?.length ??
		depositStore.currency?.length
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_OPTIONS,) && (
		optionStore.assetIds?.length ??
		optionStore.bankId?.length ??
		optionStore.maturityYear
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_LOAN,) && (
		loanStore.assetId?.length ??
		loanStore.bankId?.length ??
		loanStore.currency?.length
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_EQUITIES,) && (
		equityStore.assetId?.length ??
		equityStore.bankId?.length ??
		equityStore.currency?.length
	))	|| (location.pathname.includes(RouterKeys.ANALYTICS_METALS,) && (
		metalStore.assetIds?.length ??
		metalStore.bankId?.length ??
		metalStore.metal?.length ??
		metalStore.productTypes?.length ??
		metalStore.currency?.length
	))	|| (location.pathname.includes(RouterKeys.ANALYTICS_PRIVATE_EQUITY,) && (
		privateEquityStore.assetId?.length ??
		privateEquityStore.bankId?.length ??
		privateEquityStore.currency?.length
	))	|| (location.pathname.includes(RouterKeys.ANALYTICS_CRYPTO,) && (
		cryptoStore.assetId?.length ??
		cryptoStore.currency?.length ??
		cryptoStore.productTypes?.length ??
		cryptoStore.wallets?.length
	))	|| (location.pathname.includes(RouterKeys.ANALYTICS_REAL_ESTATE,) && (
		realEstateStore.assetIds?.length ??
		realEstateStore.city?.length ??
		realEstateStore.currency?.length
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_OTHER_INVESTMENTS,) && (
		storeFilter.investmentAssetNames?.length ??
		otherInvestmentsStore.bankId?.length ??
		otherInvestmentsStore.currency?.length
	))	|| (location.pathname.includes(RouterKeys.ANALYTICS_OVERVIEW,) && (
		overviewStore.pieAssetNames?.length ??
		overviewStore.pieBankIds?.length ??
		overviewStore.pieCurrencies?.length ??
		overviewStore.pieEntityIds?.length ??
		overviewStore.tableAssetNames?.length ??
		overviewStore.tableBankIds?.length ??
		overviewStore.tableCurrencies?.length ??
		overviewStore.tableEntityIds?.length
	)) || (location.pathname.includes(RouterKeys.ANALYTICS_TRANSACTIONS,) && (
		transactionStore.isins?.length ??
		transactionStore.securities?.length ??
		transactionStore.transactionIds?.length ??
		transactionStore.transactionTypes?.length
	))

	return Boolean(isFilterApplied,)
}