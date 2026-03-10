/* eslint-disable complexity */
import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../../shared/components'
import {
	PlusBlue,
} from '../../../../../assets/icons'
import {
	useGetBudgetPlanById,
} from '../../../../../shared/hooks'
import {
	ExpenseCategory,
} from './components/expense-category.component'
import type {
	IExpenseCategory,
} from './add-expense-categories.types'
import {
	localeString,
	toggleState,
} from '../../../../../shared/utils'
import {
	AddCategory,
} from './components/add-category.component'
import {
	useGetExpenseCategoryList,
} from '../../../../../shared/hooks'
import {
	useCreateExpenseCategory,
} from '../../../../../shared/hooks'

import * as styles from './add-expense-categories.styles'

interface IAddExpenseCategoriesProps {
	budgetId: string | undefined
	handleCloseExpenseCategory: () => void
	isFirst?: boolean
}

export const AddExpenseCategories: React.FC<IAddExpenseCategoriesProps> = ({
	budgetId,
	handleCloseExpenseCategory,
	isFirst,
},) => {
	const [isCategoryCreating, setIsCategoryCreating,] = React.useState(Boolean(isFirst,),)
	const [categoryList, setCategoryList,] = React.useState<Array<IExpenseCategory>>([],)
	const [editIndex, setEditIndex,] = React.useState<number | undefined>(undefined,)
	const {
		data: budgetPlan,
	} = useGetBudgetPlanById(budgetId,)
	const toggleCreateCategoryVisible = toggleState(setIsCategoryCreating,)
	const {
		data: expenseCategoryList,
	} = useGetExpenseCategoryList(budgetPlan?.clientId ?? '',)
	const {
		mutateAsync: createExpenseCategory,
	} = useCreateExpenseCategory()
	const handleCreateCategory = (data: IExpenseCategory,): void => {
		setCategoryList((prevState,) => {
			if (editIndex !== undefined) {
				return prevState.map((category, index,) => {
					return (index === editIndex ?
						{
							...category, ...data,
						} :
						category)
				},
				)
			}
			return [...prevState, data,]
		},)
		toggleCreateCategoryVisible()
		setEditIndex(undefined,)
	}
	const handleCancel = (): void => {
		toggleCreateCategoryVisible()
		setEditIndex(undefined,)
	}
	const handleDeleteCategory = (index: number,): void => {
		setCategoryList((prevState,) => {
			return prevState.filter((el, i,) => {
				return i !== index
			},)
		},)
	}

	const handleEditClick = (index: number,): void => {
		setEditIndex(index,)
	}
	const editCategory = editIndex === undefined ?
		undefined :
		categoryList[editIndex]

	const totals = categoryList.length > 0 ?
		categoryList.reduce((sum, category,) => {
			return sum + (category.budget || 0)
		}, 0,) :
		0

	const handleCreateCategories = async(): Promise<void> => {
		if (categoryList.length === 0 || !budgetId) {
			return
		}
		await Promise.all(
			categoryList.map(async(category,) => {
				return createExpenseCategory({
					name:         category.category,
					budget:       Number(category.budget,),
					budgetPlanId: budgetId,
				},)
			},),
		)
		handleCloseExpenseCategory()
	}

	const categoryOptionsArray = React.useMemo(() => {
		return expenseCategoryList?.filter((expenseCategory,) => {
			return !categoryList.some((category,) => {
				return category.category === expenseCategory.name
			},)
		},
		)
			.map((category,) => {
				return {
					label: category.name,
					value: {
						id: category.name, name: category.name,
					},
				}
			},)
	}, [expenseCategoryList, categoryList,],)

	return budgetPlan && (
		<div className={styles.expenseCategoriesWrapper}>
			<div className={styles.addExpenseCategoryHeader}>
				<p className={styles.addExpenseCategoryTitle}>Add expense categories</p>
			</div>
			<div className={styles.expenseCategoriesFormWrapper}>
				<p className={styles.managementAmount}><span>Total budget:</span> <span>$ {localeString(budgetPlan.totalManage, '', 2, false,)}</span></p>
				{categoryList.length > 0 && <div className={styles.categoryList}>
					{categoryList.map((category, index,) => {
						if (index === editIndex) {
							return null
						}
						return <ExpenseCategory
							key={index}
							index={index}
							category={category}
							handleDeleteCategory={handleDeleteCategory}
							handleEditClick={handleEditClick}
							toggleCreateCategoryVisible={toggleCreateCategoryVisible}
						/>
					},)}
				</div>}
				{isCategoryCreating && <AddCategory
					cancelCreate={handleCancel}
					handleCreate={handleCreateCategory}
					categoryOptionsArray={categoryOptionsArray ?? []}
					editIndex={editIndex}
					editCategory={editCategory}
					clientId={budgetPlan.clientId}
				/>}
				<div className={styles.addBlock}>
					<Button<ButtonType.TEXT>
						className={styles.addAnotherButton(!isCategoryCreating,)}
						onClick={toggleCreateCategoryVisible}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Add another',
							size:     Size.MEDIUM,
							color:    Color.NONE,
							leftIcon: <PlusBlue width={20} height={20}/>,
						}}
					/>
					<div className={styles.totalBlock(budgetPlan.totalManage >= totals,)}>
						<p>
						Total:
						</p>
						<p>
							$ {localeString(totals, '', 2, false,)}
						</p>
					</div>
				</div>
				{budgetPlan.totalManage < totals && <p className={styles.errorMessage}>Total allocated budget amount exceeds the management limit.</p>}
			</div>
			<div className={styles.addExpenseCategoryFooter}>
				<Button<ButtonType.TEXT>
					disabled={Boolean(categoryList.length === 0,)}
					onClick={handleCreateCategories}
					className={styles.addExpenseCategoriesButton}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add categories',
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}