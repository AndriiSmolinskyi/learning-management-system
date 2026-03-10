/* eslint-disable complexity */

import * as React from 'react'

import {
	useParams,
} from 'react-router-dom'
import {
	useGetExpenseCategoriesByBudgetId,
	useGetBudgetPlanById,
	useGetBudgetBanksChartById,
} from '../../../shared/hooks'
import {
	BudgetDetailsHeader,
} from './components/header/header.component'
import {
	BudgetDetailsBlock,
} from './components/details/details.component'
import {
	Button,
	ButtonType,
	Color,
	Dialog,
	Drawer,
	Loader,
	Size,
} from '../../../shared/components'

import type {
	IBudgetTransaction,
	TAnalyticsChartData,
} from '../../../shared/types'
import {
	PenSquare,
	Plus,
} from '../../../assets/icons'
import {
	BudgetCategoryCard,
} from './components/category-card/category-card.component'
import {
	AddExpenseCategories,
} from '../budget/components/add-expense-categories/add-expense-categories.component'
import {
	toggleState,
} from '../../../shared/utils'
import {
	BudgetEditCategories,
} from './components/edit-categories/edit-categories.component'
import {
	AddTransaction,
} from './components/add-transactions/add-transactions.component'
import {
	DeleteCategoryModal,
} from './components/delete-modal/delete-category-modal.component'
import type {
	IExpenseCategory,
} from '../../../shared/types'
import {
	BudgetTransactions,
} from './components/transactions/transactions.component'
import {
	DeleteTransactionModal,
} from './components/transactions/delete-modal/delete-modal.component'
import {
	EditTransaction, TransactionDetails,
} from '../../operations/transactions/components'
import {
	AddTransactionModal,
} from './components/transactions/add-transaction-modal/add-transaction-modal.component'
import {
	useBudgetDetailsStore,
} from './budget-details.store'
import {
	ExpenseCategoryDetails,
} from './components/category-details/category-details.component'
import {
	BudgetAnnualSwitcher,
} from './components/switcher/switcher.component'
import {
	BudgetBarChart,
} from './components/chart/chart-component'

import * as styles from './budget-details.styles'

const BudgetDetailsPage: React.FC = () => {
	const chartWrapperRef = React.useRef<HTMLDivElement>(null,)
	const [tableWidth, setTableWidth,] = React.useState<number | null>(null,)
	const [isExpenseCategoryDialogOpen, setIsExpenseCategoryDialogOpen,] = React.useState<boolean>(false,)
	const [isEditCategoriesDialogOpen, setIsEditCategoriesDialogOpen,] = React.useState<boolean>(false,)
	const [isAddTransactionOpen, setIsAddTransactionOpen,] = React.useState<boolean>(false,)
	const [isAddTransactionModalOpen, setIsAddTransactionModalOpen,] = React.useState<boolean>(false,)
	const [isDeleteModalOpen, setIsDeleteModalOpen,] = React.useState<boolean>(false,)
	const [isDeleteTransactionModalOpen, setIsDeleteTransactionModalOpen,] = React.useState<boolean>(false,)
	const [expenseCategoryId, setExpenseCategoryId,] = React.useState<string | undefined>(undefined,)
	const [expenseCategory, setExpenseCategory,] = React.useState<IExpenseCategory | undefined>(undefined,)
	const [transactionId, setTransactionId,] = React.useState<number | undefined>(undefined,)
	const [transaction, setTransaction,] = React.useState<IBudgetTransaction | undefined>(undefined,)
	const [isTransactionDetailsOpen, setIsTransactionDetailsOpen,] = React.useState(false,)
	const [isCategoryDetailsOpen, setIsCategoryDetailsOpen,] = React.useState(false,)
	const [isTransactionEditOpen, setIsTransactionEditOpen,] = React.useState(false,)
	const toggleDeleteModalVisible = toggleState(setIsDeleteModalOpen,)
	const toggleDeleteTransactionModalVisible = toggleState(setIsDeleteTransactionModalOpen,)
	const toggleExpenseCategoryDialogVisible = toggleState(setIsExpenseCategoryDialogOpen,)
	const toggleEditCategoriesDialogVisible = toggleState(setIsEditCategoriesDialogOpen,)
	const toggleAddTransactionVisible = toggleState(setIsAddTransactionOpen,)
	const toggleAddTransactionModaVisible = toggleState(setIsAddTransactionModalOpen,)
	const toggleCategoryDetailsVisible = toggleState(setIsCategoryDetailsOpen,)

	const toggleDeleteVisible = React.useCallback((id?: string,) => {
		setExpenseCategoryId(id,)
		toggleDeleteModalVisible()
	}, [],)
	const toggleDeleteTransactionVisible = React.useCallback((body: IBudgetTransaction,) => {
		setTransaction(body,)
		toggleDeleteTransactionModalVisible()
	}, [],)
	const toggleAddTransaction = React.useCallback((budget: IExpenseCategory,) => {
		toggleAddTransactionVisible()
		setExpenseCategory(budget,)
	}, [],)
	const toggleCategoryViewDetails = React.useCallback((budget: IExpenseCategory,) => {
		toggleCategoryDetailsVisible()
		setExpenseCategory(budget,)
	}, [],)

	React.useEffect(() => {
		const updateWidth = (): void => {
			if (chartWrapperRef.current) {
				setTableWidth(chartWrapperRef.current.getBoundingClientRect().width,)
			}
		}
		const observer = new ResizeObserver(() => {
			updateWidth()
		},)
		if (chartWrapperRef.current) {
			observer.observe(chartWrapperRef.current,)
		}
		return () => {
			observer.disconnect()
		}
	}, [],)

	const {
		isYearly,
	} = useBudgetDetailsStore()
	const {
		id,
	} = useParams()

	const {
		data: expenseCategories,

	} = useGetExpenseCategoriesByBudgetId({
		id:       id ?? '',
		isYearly,
	},)

	const {
		data: budgetPlan,
	} = useGetBudgetPlanById(id,)

	const {
		data: chartInfo,
		isPending: isBudgetChartPending,
	} = useGetBudgetBanksChartById(id,)

	const currencyBarChartData = (chartInfo ?
		[...chartInfo,] :
		[])
		.reduce<Array<TAnalyticsChartData>>((acc, bank,) => {
			acc.push({
				name:  bank.bankName,
				value:  isYearly ?
					bank.usdValue * 12 :
					bank.usdValue,
			},)
			return acc
		}, [],)
		.sort((a, b,) => {
			return b.value - a.value
		},)

	const clientId = React.useMemo(() => {
		return budgetPlan?.clientId ?? ''
	}, [budgetPlan,],)
	const budgetId = React.useMemo(() => {
		return budgetPlan?.id ?? ''
	}, [budgetPlan,],)

	const toggleDetailsVisible = React.useCallback((id: number,) => {
		setTransactionId(id,)
		toggleState(setIsTransactionDetailsOpen,)()
	}, [],)

	const handleDetailsDrawerClose = React.useCallback(() => {
		setTransactionId(undefined,)
		toggleState(setIsTransactionDetailsOpen,)()
	}, [],)

	const toggleEditVisible = React.useCallback((id: number,) => {
		setTransactionId(id,)
		toggleState(setIsTransactionEditOpen,)()
	}, [],)

	const handleUpdateDrawerClose = React.useCallback(() => {
		toggleState(setIsTransactionEditOpen,)()
		setTransactionId(undefined,)
	}, [],)

	const padding = 20
	const gap = 8
	const chartWidth = tableWidth && currencyBarChartData.length > 0 ?
		(tableWidth - (padding * 2) - ((currencyBarChartData.length) * gap)) / currencyBarChartData.length :
		0

	return (
		<div className={styles.pageWrapper}>
			<div className={styles.headerWrapper}>
				<BudgetDetailsHeader />
				<BudgetAnnualSwitcher/>
			</div>
			<div className={styles.contentWrapper} ref={chartWrapperRef}>
				{budgetPlan && <BudgetDetailsBlock
					budgetPlan={budgetPlan}
				/>}
				<div className={styles.expenseWrapper}>
					<div className={styles.expenseHeader}>
						<p className={styles.expenseTitle}>Expense categories</p>
						{Boolean(expenseCategories && expenseCategories.length > 0,) ?
							<Button<ButtonType.TEXT>
								className={styles.expenseEditButton}
								onClick={toggleEditCategoriesDialogVisible}
								additionalProps={{
									btnType:  ButtonType.TEXT,
									text:     'Edit',
									size:     Size.SMALL,
									color:    Color.SECONDRAY_COLOR,
									leftIcon: <PenSquare width={20} height={20} />,
								}}
							/> :
							<Button<ButtonType.TEXT>
								className={styles.expenseEditButton}
								onClick={toggleExpenseCategoryDialogVisible}
								additionalProps={{
									btnType:  ButtonType.TEXT,
									text:     'Add expense categories',
									size:     Size.SMALL,
									color:    Color.BLUE,
									leftIcon: <Plus width={20} height={20} />,
								}}
							/>}
					</div>
					{expenseCategories && Boolean(expenseCategories.length > 0,) && <div className={styles.expenseList}>
						{expenseCategories.map((category,) => {
							return <BudgetCategoryCard
								key={category.id}
								category={category}
								available={budgetPlan?.totalManage}
								toggleDeleteVisible={toggleDeleteVisible}
								toggleAddTransaction={toggleAddTransaction}
								toggleCategoryViewDetails={toggleCategoryViewDetails}
							/>
						},)}
					</div>}
				</div>
				{isBudgetChartPending && <Loader/>}
				<div className={styles.chartSectionWrapper}>
					<BudgetBarChart
						data={currencyBarChartData}
						gap={gap}
						width={chartWidth < 150 ?
							undefined :
							chartWidth}
					/>
				</div>
				<BudgetTransactions
					clientId={clientId}
					budgetId={budgetId}
					expenseCategories={expenseCategories ?? []}
					toggleDetailsVisible={toggleDetailsVisible}
					toggleEditVisible={toggleEditVisible}
					toggleDeleteTransactionVisible={toggleDeleteTransactionVisible}
					openAddModal={() => {
						setIsAddTransactionModalOpen(true,)
					}}
				/>
			</div>
			<Drawer
				isOpen={isExpenseCategoryDialogOpen}
				onClose={toggleExpenseCategoryDialogVisible}
				isCloseButtonShown
			>
				<AddExpenseCategories
					budgetId={budgetPlan?.id}
					handleCloseExpenseCategory={toggleExpenseCategoryDialogVisible}
					isFirst
				/>
			</Drawer>
			<Drawer
				isOpen={isEditCategoriesDialogOpen}
				onClose={toggleEditCategoriesDialogVisible}
				isCloseButtonShown
			>
				{expenseCategories && budgetPlan && <BudgetEditCategories
					categories={expenseCategories}
					handleCloseEditCategories={toggleEditCategoriesDialogVisible}
					budgetPlan={budgetPlan}
				/>}
			</Drawer>
			<Drawer
				isOpen={isAddTransactionOpen}
				onClose={toggleAddTransactionVisible}
				isCloseButtonShown
			>
				{expenseCategory && <AddTransaction
					expenseCategory={expenseCategory}
					onClose={toggleAddTransactionVisible}
				/>}
			</Drawer>
			<Drawer
				isOpen={isCategoryDetailsOpen}
				onClose={toggleCategoryDetailsVisible}
				isCloseButtonShown
			>
				{expenseCategory && <ExpenseCategoryDetails
					expenseCategoryId={expenseCategory.id}
					onClose={toggleCategoryDetailsVisible}
					toggleDetailsVisible={toggleDetailsVisible}
					toggleEditVisible={toggleEditVisible}
					toggleDeleteTransactionVisible={toggleDeleteTransactionVisible}
					toggleAddTransaction={toggleAddTransaction}

				/>}
			</Drawer>
			<Dialog
				onClose={() => {
					setIsAddTransactionModalOpen(false,)
				}}
				open={isAddTransactionModalOpen}
				isCloseButtonShown
			>
				<AddTransactionModal
					onClose={toggleAddTransactionModaVisible}
					toggleAddTransaction={toggleAddTransaction}
					expenseCategories={expenseCategories ?? []}
				/>
			</Dialog>
			<Dialog
				onClose={() => {
					setIsDeleteModalOpen(false,)
				}}
				open={isDeleteModalOpen}
				isCloseButtonShown
			>
				<DeleteCategoryModal
					onClose={toggleDeleteModalVisible}
					expenseCategoryId={expenseCategoryId}
					clientId={clientId}
				/>
			</Dialog>
			<Dialog
				onClose={() => {
					setIsDeleteTransactionModalOpen(false,)
				}}
				open={isDeleteTransactionModalOpen}
				isCloseButtonShown
			>
				<DeleteTransactionModal
					onClose={toggleDeleteTransactionModalVisible}
					transaction={transaction}
				/>
			</Dialog>
			<Drawer
				isOpen={isTransactionDetailsOpen}
				onClose={handleDetailsDrawerClose}
				isCloseButtonShown
			>
				{transactionId && <TransactionDetails
					onClose={handleDetailsDrawerClose}
					transactionId={transactionId}
					toggleUpdateVisible={toggleEditVisible}
				/>}
			</Drawer>
			<Drawer
				isOpen={isTransactionEditOpen}
				onClose={handleUpdateDrawerClose}
				isCloseButtonShown
			>
				<EditTransaction
					transactionId={transactionId}
					onClose={handleUpdateDrawerClose}
				/>
			</Drawer>
		</div>
	)
}

export default BudgetDetailsPage