/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import React from 'react'
import {
	useLocation,
} from 'react-router-dom'
import {
	Check,
	PanelOpen,
} from '../../../assets/icons'
import {
	AddTransaction,
	TransactionHeader,
	TransactionDetails,
	TransactionTable,
} from './components'
import {
	CustomDialog,
	Drawer,
} from '../../../shared/components'
import {
	useTransactionStore,
} from './transaction.store'
import {
	toggleState,
} from '../../../shared/utils'
import {
	useOperationsFilterStore,
} from '../layout/components/filter/filter.store'
import type {
	TransactionFilter,
} from '../../../services/analytics/analytics.types'
import {
	Color,
	Button,
	ButtonType,
	Size,
} from '../../../shared/components'
import {
	useTransactionAnalyticsByIds,
} from '../../../shared/hooks/analytics/transaction.hooks'
import {
	TransactionsChart,
} from '../../../modules/analytics/transactions/components'
import {
	TransactionsSettings,
} from '../../../modules/analytics/transactions/components'
import type {
	IOptionType, SelectOptionType,
} from '../../../shared/types'
import {
	formatToUTCISOString,
} from '../../../shared/utils'

import * as styles from './transactions.styles'

const Transactions: React.FC = () => {
	const location = useLocation()
	const portfolioId = location.state?.portfolioId
	const portfolioName = location.state?.portfolioName

	const [transactionId, setTransactionId,] = React.useState<number | undefined>()
	const [draftId, setDraftId,] = React.useState<number | undefined>()
	const [isCreateOpen, setIsCreateOpen,] = React.useState(false,)
	const [isDetailsOpen, setIsDetailsOpen,] = React.useState(false,)
	const [isUpdateOpen, setIsUpdateOpen,] = React.useState(false,)
	const [isSuccessDialogOpen, setIsSuccessDialogOpen,] = React.useState(false,)
	const [isExitDialogOpen, setIsExitDialogOpen,] = React.useState(false,)
	const [initialIsinOptions, setInitialIsinOptions,] = React.useState<Array<IOptionType<SelectOptionType>> | undefined>(undefined,)
	const [initialSecurityOptions, setInitialSecurityOptions,] = React.useState<Array<IOptionType<SelectOptionType>> | undefined>(undefined,)
	const [totalCurrencyValue, setTotalCurrencyValue,] = React.useState(0,)
	const [totalUsdValue, setTotalUsdValue,] = React.useState(0,)
	const [initialOldestDate, setInitialOldestDate,] = React.useState<string | null>(null,)

	const {
		setPortfolioId,
		filter,
		setIsins,
		setSecurities,
		setTransactionTypes,
		setDateRange,
		setIsCalendarError,
		setShowChart,
		showChart,
	} = useTransactionStore()

	const {
		operationsFilter,
		setPortfolioIds,
		setEntitiesIds,
		setDate,
		setServiceProviders,
		setAccountIds,
		setBankIds,
		setClientsIds,
		setCurrencies,
	} = useOperationsFilterStore()

	React.useEffect((() => {
		if (portfolioId && portfolioName) {
			setPortfolioId(portfolioId,)
			setPortfolioIds([{
				label: portfolioName, value: {
					id: portfolioId, name: portfolioName,
				},
			},],)
		} else {
			setPortfolioId(undefined,)
		}
	}), [portfolioId,portfolioName,],)

	const toggleCreateVisible = React.useCallback(() => {
		toggleState(setIsCreateOpen,)()
	}, [],)

	const handleAddDrawerClose = React.useCallback((id?: number,) => {
		setDraftId(undefined,)
		setTransactionId(id,)
		setIsExitDialogOpen(false,)
	}, [],)

	const handleAddDrawerCloseFromModal = React.useCallback((id?: number,) => {
		setDraftId(undefined,)
		setTransactionId(id,)
		toggleState(setIsCreateOpen,)()
	}, [],)

	const toggleSuccessDialogVisible = React.useCallback(() => {
		toggleState(setIsSuccessDialogOpen,)()
	}, [],)

	const toggleExitDialogVisible = React.useCallback(() => {
		toggleState(setIsExitDialogOpen,)()
	}, [],)

	const handleDraftResume = React.useCallback((id: number,) => {
		setDraftId(id,)
		toggleCreateVisible()
	}, [],)

	const toggleDetailsVisible = React.useCallback((id: number,) => {
		setTransactionId(id,)
		toggleState(setIsDetailsOpen,)()
	}, [],)

	const handleDetailsDrawerClose = React.useCallback(() => {
		setTransactionId(undefined,)
		toggleState(setIsDetailsOpen,)()
	}, [],)

	const toggleUpdateVisible = React.useCallback((id: number,) => {
		setTransactionId(id,)
		toggleState(setIsUpdateOpen,)()
	}, [],)

	const handleUpdateDrawerClose = React.useCallback(() => {
		toggleState(setIsUpdateOpen,)()
		setTransactionId(undefined,)
	}, [],)

	const isValidDate = (d: unknown,): d is Date => {
		return d instanceof Date && !isNaN(d.getTime(),)
	}

	const combinedFilter: TransactionFilter = React.useMemo(() => {
		return {
			clientIds: operationsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds: operationsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			entityIds: operationsFilter.entitiesIds?.map((item,) => {
				return item.value.id
			},),
			bankListIds: operationsFilter.bankIds?.map((item,) => {
				return item.value.id
			},),
			accountIds: operationsFilter.accountIds?.map((account,) => {
				return account.value.id
			},),
			currencies: operationsFilter.currencies?.map((item,) => {
				return item.value.name
			},),
			serviceProviders: operationsFilter.serviceProviders?.map((item,) => {
				return item.value.name
			},),
			date:             operationsFilter.date,
			dateRange:   filter.isError ?
				undefined :
				isValidDate(filter.dateRange?.[0],) && isValidDate(filter.dateRange[1],) ?
					[formatToUTCISOString(filter.dateRange[0],),formatToUTCISOString(filter.dateRange[1],),] :
					undefined,
			transactionTypes: filter.transactionTypes,
			isins:            filter.isins,
			securities:       filter.securities,
			transactionIds:   filter.transactionIds,
		}
	}, [operationsFilter, filter,],)

	const {
		data: plData,
		isPending: plFetching,
	} = useTransactionAnalyticsByIds(combinedFilter,)

	React.useEffect(() => {
		if (plData) {
			setTotalUsdValue(plData.totalUsdValue,)
		}
	}, [plData,],)
	React.useEffect(() => {
		if (plData) {
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

	const totalTransaction = plData?.total

	const isinOptions: Array<IOptionType<SelectOptionType>> = initialIsinOptions?.filter((opt,) => {
		return !filter.isins?.includes(opt.value.name,)
	},) ?? []

	const securityOptions: Array<IOptionType<SelectOptionType>> = initialSecurityOptions?.filter((opt,) => {
		return !filter.securities?.includes(opt.value.name,)
	},) ?? []

	return (
		<>
			<TransactionHeader toggleCreateVisible={toggleCreateVisible} />
			<div className={styles.container}>
				<div className={styles.containerTop(showChart,)}>
					<div className={styles.leftSection}>
						<TransactionTable
							toggleCreateVisible={toggleCreateVisible}
							toggleDetailsVisible={toggleDetailsVisible}
							toggleUpdateVisible={toggleUpdateVisible}
							handleResume={handleDraftResume}
							isUpdateOpen={isUpdateOpen}
							handleUpdateDrawerClose={handleUpdateDrawerClose}
							transactionId={transactionId}
							totalUsdValue={totalUsdValue}
							totalCurrencyValue={totalCurrencyValue}
							totalTransaction={totalTransaction}
						/>
					</div>
					<div
						className={styles.rightSection(showChart,)}
					>
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
								setAccountIds={setAccountIds}
								setBankIds={setBankIds}
								setClientsIds={setClientsIds}
								setCurrencies={setCurrencies}
								analyticsFilter={operationsFilter}
								setPortfolioIds={setPortfolioIds}
								setEntitiesIds={setEntitiesIds}
								setDate={setDate}
								setServiceProviders={setServiceProviders}
								plFetching={plFetching}
							/>
						</div>
						<div className={styles.bottomRightSection}>
							<TransactionsChart
								plData={plData}
								plFetching={plFetching}
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

				<Drawer
					isOpen={isCreateOpen}
					onClose={toggleExitDialogVisible}
					isCloseButtonShown
				>
					<AddTransaction
						draftId={draftId}
						isExitDialogOpen={isExitDialogOpen}
						setTransactionId={setTransactionId}
						toggleExitDialogVisible={toggleExitDialogVisible}
						toggleSuccessDialogVisible={toggleSuccessDialogVisible}
						onClose={handleAddDrawerCloseFromModal}
						onCloseButtonClick={handleAddDrawerClose}
					/>
				</Drawer>
				<Drawer
					isOpen={isDetailsOpen}
					onClose={handleDetailsDrawerClose}
					isCloseButtonShown
				>
					<TransactionDetails
						onClose={handleDetailsDrawerClose}
						transactionId={transactionId}
						toggleUpdateVisible={toggleUpdateVisible}
					/>
				</Drawer>
				<CustomDialog
					open={isSuccessDialogOpen}
					icon={<Check width={42} height={42}/>}
					title='New transaction added!'
					isCloseButtonShown
					submitBtnColor={Color.SECONDRAY_GRAY}
					submitBtnText='View details'
					isCancelBtn={false}
					onCancel={toggleSuccessDialogVisible}
					onSubmit={() => {
						toggleSuccessDialogVisible()
						toggleState(setIsDetailsOpen,)()
					}}
				/>
			</div>

		</>
	)
}

export default Transactions
