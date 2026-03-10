import React from 'react'
import {
	useLocation,
} from 'react-router-dom'

import {
	AnalyticsFilterDialog,
} from './filter-dialog.component'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../shared/components'
import {
	CloseXIcon, Filter,
	HistoryClockIcon,
	Refresh,
} from '../../../../../assets/icons'
import {
	useLoanStore,
} from '../../../../analytics/loan'
import {
	useOtherInvestmentsStore,
} from '../../../../analytics/other-investments'
import {
	useMetalsStore,
} from '../../../../analytics/metals'
import {
	useAnalyticTransactionStore,
} from '../../../../analytics/transactions'
import {
	useAnalyticsFilterStore,
} from '../../../../analytics/analytics-store'
import type {
	TAnalyticsFilter,
} from './analytics-filter.types'
import {
	useBondStore,
} from '../../../../analytics/bonds'
import {
	useCashStore,
} from '../../../cash/cash.store'
import {
	useCryptoStore,
} from '../../../crypto'
import {
	useDepositStore,
} from '../../../deposit'
import {
	useRealEstateStore,
} from '../../../real-estate/real-estate.store'
import {
	usePrivateEquityStore,
} from '../../../private-equity'
import {
	useOptionsStore,
} from '../../../options/options.store'
import {
	useEquityStore,
} from '../../../equities/'
import {
	useOverviewStore,
} from '../../../overview/overview.store'
import {
	useGetFilterApplied,
	useGetGlobalRefreshActivated,
} from './analytics-filter.util'
import {
	RouterKeys,
} from '../../../../../router/keys'
import {
	format,
} from 'date-fns'

import * as styles from './analytics-filter.styles'

export const initialFilterValues: TAnalyticsFilter = {
	clientIds:            undefined,
	portfolioIds:         undefined,
	entitiesIds:          undefined,
	bankIds:              undefined,
	accountIds:           undefined,
	isins:                undefined,
	securities:           undefined,
	currencies:           undefined,
	pairs:                undefined,
	loanNames:            undefined,
	cryptoTypes:          undefined,
	wallets:              undefined,
	productTypes:         undefined,
	metalProductTypes:         undefined,
	metals:               undefined,
	investmentAssetNames: undefined,
	otherNames:           undefined,
	serviceProviders:     undefined,
	operations:           undefined,
	projectTransactions:  undefined,
	countries:            undefined,
	cities:               undefined,
	equityTypes:          undefined,
	privateEquityNames:   undefined,
	privateEquityTypes:   undefined,
	date:                 undefined,
}

export const AnalyticsFilter: React.FC = () => {
	const {
		resetAnalyticsFilterStore,
		analyticsFilter: storeFilter,
	} = useAnalyticsFilterStore()
	const location = useLocation()
	const [isFilterVisible, setIsFilterVisible,] = React.useState<boolean>(false,)
	const [isRefreshClicked, setIsRefreshClicked,] = React.useState<boolean>(false,)
	const [analyticsFilter, setAnalyticsFilter,] = React.useState<TAnalyticsFilter>(storeFilter,)

	const isFilterApplied = useGetFilterApplied()
	const isRefreshActive = useGetGlobalRefreshActivated()

	React.useEffect(() => {
		setAnalyticsFilter(storeFilter,)
		return () => {
			setAnalyticsFilter(storeFilter,)
		}
	}, [storeFilter, setAnalyticsFilter, isFilterVisible,],)

	const {
		resetCashStore,
	} = useCashStore()

	const {
		resetOptionsStore,
	} = useOptionsStore()

	const {
		resetEquityStore,
	} = useEquityStore()

	const {
		resetRealEstateStore,
	} = useRealEstateStore()

	const {
		resetLoanStore,
	} = useLoanStore()

	const {
		resetBondStore,
	} = useBondStore()

	const {
		resetOtherInvestmentsStore,
	} = useOtherInvestmentsStore()

	const {
		resetMetalsStore,
	} = useMetalsStore()

	const {
		resetTransactionStore,
		setShowChart,
	} = useAnalyticTransactionStore()

	const {
		resetCryptoStore,
	} = useCryptoStore()

	const {
		resetDepositStore,
	} = useDepositStore()

	const {
		resetPrivateEquityStore,
	} = usePrivateEquityStore()

	const {
		resetOverviewStore,
	} = useOverviewStore()

	const handleRefresh = (): void => {
		setIsRefreshClicked(true,)
		resetCashStore()
		resetRealEstateStore()
		resetLoanStore()
		resetBondStore()
		resetOtherInvestmentsStore()
		resetMetalsStore()
		resetTransactionStore()
		resetAnalyticsFilterStore()
		resetCryptoStore()
		resetDepositStore()
		resetPrivateEquityStore()
		resetOptionsStore()
		resetEquityStore()
		resetOverviewStore()
		setAnalyticsFilter(initialFilterValues,)
	}
	// const handleDateClear = (): void => {
	// 	setDate(undefined,)
	// }
	return (
		<div className={styles.filterContainer(Boolean(analyticsFilter.date,),)}>
			<AnalyticsFilterDialog
				setDialogOpen={setIsFilterVisible}
				analyticsFilter={analyticsFilter}
				setAnalyticsFilter={setAnalyticsFilter}
				setIsRefreshClicked={setIsRefreshClicked}
				isRefreshClicked={isRefreshClicked}
			>
				<Button<ButtonType.TEXT>
					className={styles.filterButton(isFilterVisible, isFilterApplied,)}
					onClick={() => {
						if (location.pathname.includes(RouterKeys.ANALYTICS_TRANSACTIONS,)) {
							setShowChart()
						} else {
							setIsFilterVisible((prev,) => {
								return !prev
							},)
						}
					}}
					additionalProps={{
						btnType: ButtonType.TEXT,
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_COLOR,
						text:    isFilterVisible ?
							'Close' :
							'Filter',
						leftIcon: isFilterVisible ?
							<CloseXIcon width={20} height={20} /> :
							<Filter width={20} height={20} />,
					}}
				/>
			</AnalyticsFilterDialog>
			<Button<ButtonType.ICON>
				disabled={!(isFilterApplied || isRefreshActive)}
				onClick={handleRefresh}
				additionalProps={{
					btnType: ButtonType.ICON,
					size:    Size.MEDIUM,
					color:   Color.SECONDRAY_GRAY,
					icon:    <Refresh width={20} height={20} />,
				}}
			/>
			{analyticsFilter.date && <p className={styles.historyDate}><HistoryClockIcon width={18} height={18}/><span>-</span><span>{format(analyticsFilter.date, 'dd.MM.yyyy',)}</span>
				{/* <CloseXIcon width={16} height={16} className={styles.dateClearButton} onClick={handleDateClear}/> */}
			</p>}
		</div>
	)
}
