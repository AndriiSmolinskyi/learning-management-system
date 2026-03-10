/* eslint-disable complexity */
import React from 'react'
import {
	useLocation,
} from 'react-router-dom'
import {
	BondsFilterSelects,
	DepositFilterSelects,
	OptionFilterSelects,
	LoanFilterSelects,
	CryptoFilterSelects,
	MetalFilterSelects,
	OtherFilterSelects,
	RealEstateFilterSelects,
	EquityFilterSelects,
	PrivateEquityFilterSelects,
	TransactionFilterSelects,
} from './'
import type {
	TAnalyticsFilter,
} from '../analytics-filter.types'
import {
	RouterKeys,
} from '../../../../../../router/keys'
import {
	CashFilterSelects,
} from './cash.component'

interface IProps {
 setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>>
	analyticsFilter: TAnalyticsFilter
}

export const AssetVariablesFilter: React.FC<IProps> = ({
	analyticsFilter,
	setAnalyticsFilter,
},) => {
	const location = useLocation()
	const bankIds = analyticsFilter.bankIds?.map((bank,) => {
		return bank.value.id
	},)

	if (location.pathname.includes(RouterKeys.ANALYTICS_BONDS,)) {
		return <BondsFilterSelects analyticsFilter={analyticsFilter} setAnalyticsFilter={setAnalyticsFilter} />
	}

	if (location.pathname.includes(RouterKeys.ANALYTICS_DEPOSIT,)) {
		return <DepositFilterSelects analyticsFilter={analyticsFilter} setAnalyticsFilter={setAnalyticsFilter} />
	}

	if (location.pathname.includes(RouterKeys.ANALYTICS_CASH,)) {
		return <CashFilterSelects analyticsFilter={analyticsFilter} setAnalyticsFilter={setAnalyticsFilter} />
	}

	if (location.pathname.includes(RouterKeys.ANALYTICS_OPTIONS,)) {
		return (
			<OptionFilterSelects
				analyticsFilter={analyticsFilter}
				setAnalyticsFilter={setAnalyticsFilter}
				bankIds={bankIds}
			/>
		)
	}

	if (location.pathname.includes(RouterKeys.ANALYTICS_LOAN,)) {
		return (
			<LoanFilterSelects
				analyticsFilter={analyticsFilter}
				setAnalyticsFilter={setAnalyticsFilter}
				bankIds={bankIds}
			/>
		)
	}

	if (location.pathname.includes(RouterKeys.ANALYTICS_CRYPTO,)) {
		return (
			<CryptoFilterSelects
				analyticsFilter={analyticsFilter}
				setAnalyticsFilter={setAnalyticsFilter}
				bankIds={bankIds}
			/>
		)
	}

	if (location.pathname.includes(RouterKeys.ANALYTICS_METALS,)) {
		return (
			<MetalFilterSelects
				analyticsFilter={analyticsFilter}
				setAnalyticsFilter={setAnalyticsFilter}
			/>
		)
	}

	if (location.pathname.includes(RouterKeys.ANALYTICS_OTHER_INVESTMENTS,)) {
		return (
			<OtherFilterSelects
				analyticsFilter={analyticsFilter}
				setAnalyticsFilter={setAnalyticsFilter}
				bankIds={bankIds}
			/>
		)
	}

	if (location.pathname.includes(RouterKeys.ANALYTICS_REAL_ESTATE,)) {
		return (
			<RealEstateFilterSelects
				analyticsFilter={analyticsFilter}
				setAnalyticsFilter={setAnalyticsFilter}
				bankIds={bankIds}
			/>
		)
	}

	if (location.pathname.includes(RouterKeys.ANALYTICS_EQUITIES,)) {
		return (
			<EquityFilterSelects
				analyticsFilter={analyticsFilter}
				setAnalyticsFilter={setAnalyticsFilter}
				bankIds={bankIds}
			/>
		)
	}

	if (location.pathname.includes(RouterKeys.ANALYTICS_PRIVATE_EQUITY,)) {
		return (
			<PrivateEquityFilterSelects
				analyticsFilter={analyticsFilter}
				setAnalyticsFilter={setAnalyticsFilter}
				bankIds={bankIds}
			/>
		)
	}

	if (location.pathname.includes(RouterKeys.ANALYTICS_TRANSACTIONS,)) {
		return (
			<TransactionFilterSelects
				analyticsFilter={analyticsFilter}
				setAnalyticsFilter={setAnalyticsFilter}
				bankIds={bankIds}
			/>
		)
	}

	return null
}
