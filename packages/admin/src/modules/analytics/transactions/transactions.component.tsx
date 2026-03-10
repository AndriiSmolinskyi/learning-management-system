/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React from 'react'
import {
	PanelOpen,
} from '../../../assets/icons'
import {
	Color,
	Button,
	ButtonType,
	Size,
} from '../../../shared/components'
import {
	TransactionsChart,
	TransactionsSettings,
	TransactionsTable,
} from './components'

import {
	useTransactionAnalyticsByIds,
} from '../../../shared/hooks/analytics'
import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import {
	useAnalyticTransactionStore,
} from './transaction.store'
import type {
	TransactionFilter,
} from '../../../services/analytics/analytics.types'
import type {
	IOptionType,
} from '../../../shared/types'
import type {
	SelectOptionType,
} from './transactions.types'
import {
	useDebounce,
} from '../../../shared/hooks'
import {
	useGetFilterApplied,
} from '../layout/components/analytics-filter/analytics-filter.util'
import {
	formatToUTCISOString,
} from '../../../shared/utils'

import * as styles from './transactions.styles'

const AnalyticsTransactions: React.FunctionComponent = () => {
	const [initialIsinOptions, setInitialIsinOptions,] = React.useState<Array<IOptionType<SelectOptionType>> | undefined>(undefined,)
	const [initialSecurityOptions, setInitialSecurityOptions,] = React.useState<Array<IOptionType<SelectOptionType>> | undefined>(undefined,)
	// const [initialOldestDate, setInitialOldestDate,] = React.useState<string | null>(null,)
	const [initialOldestDate, setInitialOldestDate,] = React.useState<string | null>('27.02.2018',)

	const [totalCurrencyValue, setTotalCurrencyValue,] = React.useState(0,)
	const [totalUsdValue, setTotalUsdValue,] = React.useState(0,)

	const {
		filter,
		showChart,
		setIsins,
		setSecurities,
		setTransactionTypes,
		setDateRange,
		setIsCalendarError,
		setShowChart,
	} = useAnalyticTransactionStore()
	const {
		setCurrencies,
		setServiceProviders,
		setClientsIds,
		setPortfolioIds,
		setEntitiesIds,
		setBankIds,
		setAccountIds,
		setDate,
		analyticsFilter,
	} = useAnalyticsFilterStore()
	const isValidDate = (d: unknown,): d is Date => {
		return d instanceof Date && !isNaN(d.getTime(),)
	}
	const combinedFilter: TransactionFilter = React.useMemo(() => {
		return {
			clientIds: analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds: analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			entityIds: analyticsFilter.entitiesIds?.map((item,) => {
				return item.value.id
			},),
			bankListIds: analyticsFilter.bankIds?.map((item,) => {
				return item.value.id
			},),
			accountIds: analyticsFilter.accountIds?.map((account,) => {
				return account.value.id
			},),
			serviceProviders: analyticsFilter.serviceProviders?.map((item,) => {
				return item.value.name
			},),
			currencies: analyticsFilter.currencies?.map((item,) => {
				return item.value.name
			},),
			date:             analyticsFilter.date,
			dateRange:   filter.isError ?
				undefined :
				isValidDate(filter.dateRange?.[0],) && isValidDate(filter.dateRange[1],) ?
					[formatToUTCISOString(filter.dateRange[0],),formatToUTCISOString(filter.dateRange[1],),] :
					undefined,
			transactionTypes: filter.transactionTypes,
			isins:            filter.isins,
			securities:       filter.securities,
		}
	}, [analyticsFilter, filter,],)

	const finalFilter = useDebounce({
		...combinedFilter,
		transactionIds: filter.transactionIds,
	}, 200,)

	const {
		data: plData,
		isFetching: plFetching,
	} = useTransactionAnalyticsByIds(finalFilter,)

	React.useEffect(() => {
		if (plData) {
			setTotalUsdValue(plData.totalUsdValue,)
			setTotalCurrencyValue(plData.totalCurrencyValue,)
		}
	}, [plData,],)

	React.useEffect(() => {
		if (plData && !initialIsinOptions) {
			const isinOptions = plData.isins.map((isin,) => {
				return {
					label: isin,
					value: {
						id:   isin,
						name: isin,
					},
				}
			},)
			setInitialIsinOptions(isinOptions,)
		}
		if (plData && !initialSecurityOptions) {
			const securityOptions = plData.securities.map((security,) => {
				return {
					label: security,
					value: {
						id:   security,
						name: security,
					},
				}
			},)
			setInitialSecurityOptions(securityOptions,)
		}
		if (!initialOldestDate && plData?.oldestDate) {
			setInitialOldestDate(plData.oldestDate,)
		}
	}, [plData,],)

	const isinOptions: Array<IOptionType<SelectOptionType>> = initialIsinOptions?.filter((opt,) => {
		return !filter.isins?.includes(opt.value.name,)
	},) ?? []

	const securityOptions: Array<IOptionType<SelectOptionType>> = initialSecurityOptions?.filter((opt,) => {
		return !filter.securities?.includes(opt.value.name,)
	},) ?? []

	const isFilterApplied = useGetFilterApplied()

	return (
		<div className={styles.container}>
			<div className={styles.leftSection(showChart,)}>
				<TransactionsTable
					combinedFilter={combinedFilter}
					exelFilter={finalFilter}
					totalUsdValue={totalUsdValue}
					plFetching={plFetching}
					isFilterApplied={isFilterApplied}
					totalCurrencyValue={totalCurrencyValue}
					analyticsFilter={analyticsFilter}
				/>
			</div>
			<div className={styles.rightSection(showChart,)}>
				<div className={styles.topRightSection}>
					<TransactionsSettings
						isinOptions={isinOptions}
						securityOptions={securityOptions}
						filter={filter}
						setIsins={setIsins}
						setSecurities={setSecurities}
						setTransactionTypes={setTransactionTypes}
						setDateRange={setDateRange}
						setIsCalendarError={setIsCalendarError}
						sliderStartDate={initialOldestDate}
						setCurrencies={setCurrencies}
						setServiceProviders={setServiceProviders}
						setClientsIds={setClientsIds}
						setPortfolioIds={setPortfolioIds}
						setEntitiesIds={setEntitiesIds}
						setBankIds={setBankIds}
						setAccountIds={setAccountIds}
						setDate={setDate}
						analyticsFilter={analyticsFilter}
						plFetching={plFetching}
					/>
				</div>
				<div className={styles.bottomRightSection}>
					<TransactionsChart
						plData={plData}
						plFetching={plFetching}
						isFilterApplied={isFilterApplied}
					/>
				</div>
			</div>
			<div className={styles.openChartBtnContainer}>
				<Button<ButtonType.ICON>
					type='button'
					className={styles.openChartBtn(showChart,)}
					onClick={setShowChart}
					additionalProps={{
						btnType:  ButtonType.ICON,
						icon:     <PanelOpen />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
			</div>
		</div>
	)
}

export default AnalyticsTransactions
