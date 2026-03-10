/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */

import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Dialog,
	Drawer,
	Loader,
	Size,
} from '../../../shared/components'
import {
	BudgetHeader,
} from './components/header/header.component'
import {
	toggleState,
} from '../../../shared/utils'
import {
	AddBudgetPlan,
} from './components/add-budget-plan/add-budget-plan.component'
import {
	useGetBudgetPlansFiltered,
	useGetBudgetDrafts,
	useDebounce,
} from '../../../shared/hooks'
import {
	BudgetCard,
} from './components/budget-card/budget-card.component'
import {
	useBudgetStore,
} from './budget.store'
import {
	BudgetDraftCard,
} from './components/budget-draft-card/budget-draft-card.component'
import {
	EditBudgetPlan,
} from './components/edit-budget-plan/edit-budget-plan.component'
import {
	SuccessModal,
} from './components/success-modal/succes-modal.component'
import {
	AddExpenseCategories,
} from './components/add-expense-categories/add-expense-categories.component'
import {
	DeleteBudgetModal,
} from '../budget-details/components/delete-modal/delete-modal.component'
import {
	SuccessCategoriesModal,
} from './components/success-modal/succes-categories-modal.component'
import {
	ClientSearchEmpty,
} from '../../clients/client-profiles/clients/components/client-list/client-search-fall.component'
import {
	EmptyState, Plus,
} from '../../../assets/icons'

import * as styles from './budget.styles'
import {
	MockupBudgetCard,
} from './components/mockup-budget-card/mockup-budget-card.component'

const BudgetPage: React.FC = () => {
	const [isAddDrawerOpen, setIsAddDrawerOpen,] = React.useState<boolean>(false,)
	const [isExitDialogOpen, setIsExitDialogOpen,] = React.useState<boolean>(false,)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen,] = React.useState<boolean>(false,)
	const [isSuccessDialogOpen, setIsSuccessDialogOpen,] = React.useState<boolean>(false,)
	const [isSuccessCategoriesDialogOpen, setIsSuccessCategoriesDialogOpen,] = React.useState<boolean>(false,)
	const [isExpenseCategoryDialogOpen, setIsExpenseCategoryDialogOpen,] = React.useState<boolean>(false,)
	const [budgetPlanId, setBudgetPlanId,] = React.useState<string | undefined>(undefined,)
	const [budgetDraftId, setBudgetDraftId,] = React.useState<string | undefined>(undefined,)
	const [isEditOpen, setIsEditOpen,] = React.useState<boolean>(false,)

	const {
		filter,
		resetBudgetStore,
		mutatingBudgets,
	} = useBudgetStore()
	const updatedFilter = {
		...filter,
		clientIds: filter.clientIds?.map((client,) => {
			return client.value.id
		},),
	}
	const finalFilter = useDebounce(updatedFilter, 200,)
	const {
		data: budgetPlanList,
		isFetching: isBudgetFetching,
	} = useGetBudgetPlansFiltered(finalFilter,)
	const {
		data: draftList,
		isFetching: isBudgetDraftsFetching,
	} = useGetBudgetDrafts()

	const toggleCreateVisible = React.useCallback(() => {
		toggleState(setIsAddDrawerOpen,)()
	}, [],)
	const toggleExitDialogVisible = toggleState(setIsExitDialogOpen,)
	const toggleDeleteDialogVisible = toggleState(setIsDeleteDialogOpen,)
	const toggleDialogDialogVisible = toggleState(setIsSuccessDialogOpen,)
	const toggleSuccessCategoriesVisible = toggleState(setIsSuccessCategoriesDialogOpen,)
	const toggleExpenseCategoryDialogVisible = toggleState(setIsExpenseCategoryDialogOpen,)
	const toggleEditVisible = React.useCallback((id?: string,) => {
		setBudgetPlanId(id,)
		toggleState(setIsEditOpen,)()
	}, [],)

	const toggleDeleteVisible = React.useCallback((id?: string,) => {
		setBudgetPlanId(id,)
		toggleDeleteDialogVisible()
	}, [],)

	const handleAddBudgetDrawerClose = React.useCallback((id?: string,) => {
		toggleState(setIsAddDrawerOpen,)()
		setBudgetDraftId(undefined,)
	}, [],)

	const handleDraftResume = (id: string,): void => {
		setBudgetDraftId(id,)
		toggleCreateVisible()
	}

	const handleEditDrawerClose = React.useCallback(() => {
		toggleState(setIsEditOpen,)()
		setBudgetPlanId(undefined,)
	}, [],)

	const handleAddExpenseCategories = ():void => {
		setIsSuccessDialogOpen(false,)
		setIsExpenseCategoryDialogOpen(true,)
	}

	const handleCloseExpenseCategory = (): void => {
		toggleExpenseCategoryDialogVisible()
		toggleSuccessCategoriesVisible()
	}

	const hasFilters = filter.clientIds !== undefined || filter.isActivated !== undefined || filter.search !== undefined

	const existingBudgetIds = budgetPlanList?.map((budget,) => {
		return budget.id
	},) ?? []
	const mockupBudgets = mutatingBudgets?.filter((budget,) => {
		return !existingBudgetIds.includes(budget.id,)
	},)
	return (
		<div className={styles.pageWrapper}>
			<BudgetHeader
				toggleCreateVisible={toggleCreateVisible}
			/>
			<div className={styles.listWrapper}>
				<ul className={styles.budgetList}>
					{mockupBudgets?.map((budget,) => {
						return <MockupBudgetCard budget={budget}/>
					},)}
					{draftList?.map((budget,) => {
						return <BudgetDraftCard
							key={budget.id}
							budgetDraft={budget}
							handleResume={handleDraftResume}
						/>
					},)}
					{budgetPlanList?.map((budget,) => {
						return <BudgetCard
							key={budget.id}
							budgetPlan={budget}
							toggleEditVisible={toggleEditVisible}
							toggleDeleteVisible={toggleDeleteVisible}
						/>
					},)}
				</ul>
				{(isBudgetFetching || isBudgetDraftsFetching) ?
					(
						<Loader/>
					) :
					(Boolean(draftList?.length,) || Boolean(budgetPlanList?.length,)) ?
						null :
						(
							hasFilters ?
								(
									<ClientSearchEmpty clearSearch={resetBudgetStore}/>
								) :
								(
									<div className={styles.emptyContainer}>
										<EmptyState/>
										<p className={styles.emptyText}>Nothing here yet. Add budget to get started</p>
										<Button<ButtonType.TEXT>
											disabled={false}
											onClick={toggleCreateVisible}
											additionalProps={{
												btnType:  ButtonType.TEXT,
												text:     'Add budget plan',
												leftIcon: <Plus width={20} height={20} />,
												size:     Size.MEDIUM,
												color:    Color.BLUE,
											}}
										/>
									</div>
								)
						)}
			</div>
			<Drawer
				isOpen={isAddDrawerOpen}
				isCloseButtonShown
				onClose={toggleExitDialogVisible}
			>
				<AddBudgetPlan
					toggleExitDialogVisible={toggleExitDialogVisible}
					isExitDialogOpen={isExitDialogOpen}
					onClose={handleAddBudgetDrawerClose}
					budgetDraftId={budgetDraftId}
					toggleDialogDialogVisible={toggleDialogDialogVisible}
					setBudgetPlanId={setBudgetPlanId}
					setIsExitDialogOpen={setIsExitDialogOpen}
				/>
			</Drawer>
			<Drawer
				isOpen={isEditOpen}
				onClose={handleEditDrawerClose}
				isCloseButtonShown
			>
				<EditBudgetPlan
					onClose={handleEditDrawerClose}
					budgetPlanId={budgetPlanId}
				/>
			</Drawer>
			<Dialog
				onClose={() => {
					setIsSuccessDialogOpen(false,)
				}}
				open={isSuccessDialogOpen}
				isCloseButtonShown
				backdropClassName={styles.exitDialogBackdrop}
			>
				<SuccessModal
					onAddExpenseClick={handleAddExpenseCategories}
					budgetId={budgetPlanId}
				/>
			</Dialog>
			<Dialog
				onClose={() => {
					setIsSuccessCategoriesDialogOpen(false,)
				}}
				open={isSuccessCategoriesDialogOpen}
				isCloseButtonShown
				backdropClassName={styles.exitDialogBackdrop}
			>
				<SuccessCategoriesModal
					toggleVisible={toggleSuccessCategoriesVisible}
					budgetId={budgetPlanId}
				/>
			</Dialog>
			<Drawer
				isOpen={isExpenseCategoryDialogOpen}
				onClose={toggleExpenseCategoryDialogVisible}
				isCloseButtonShown
			>
				<AddExpenseCategories
					budgetId={budgetPlanId}
					handleCloseExpenseCategory={handleCloseExpenseCategory}
					isFirst
				/>
			</Drawer>
			<Dialog
				onClose={() => {
					setIsDeleteDialogOpen(false,)
				}}
				open={isDeleteDialogOpen}
				isCloseButtonShown
			>
				<DeleteBudgetModal
					onClose={toggleDeleteVisible}
					budgetId={budgetPlanId}
				/>
			</Dialog>
		</div>
	)
}

export default BudgetPage