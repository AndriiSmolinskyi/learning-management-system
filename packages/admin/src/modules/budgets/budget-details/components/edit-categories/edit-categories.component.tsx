/* eslint-disable complexity */

import * as React from 'react'

import {
	Button, ButtonType, Color, Size,
} from '../../../../../shared/components'
import {
	PlusBlue,
	Refresh,
} from '../../../../../assets/icons'
import type {
	IExpenseCategory,
} from '../../../../../shared/types'
import {
	AddCategory,
} from './components/add-expense-category.component'
import {
	ExpenseCategory,
} from './components/expense-category.component'
import {
	ExpenseCategory as NewExpenseCategory,
} from '../../../budget/components/add-expense-categories/components/expense-category.component'
import {
	AddCategory as NewAddCategory,
} from '../../../budget/components/add-expense-categories/components/add-category.component'
import type {
	IBudgetPlan,
} from '../../../../../shared/types'
import {
	localeString,
	toggleState,
} from '../../../../../shared/utils'
import {
	useUpdateAllCategoriesByBudgetId,
	useGetExpenseCategoryList,
} from '../../../../../shared/hooks'
import type {
	INewExpenseCategory,
} from './edit-categories.types'
import {
	isDeepEqual,
} from '../../../../../shared/utils'

import * as styles from './edit-categories.styles'

interface IProps {
	budgetPlan: IBudgetPlan
	categories: Array<IExpenseCategory>
	handleCloseEditCategories: () => void
}
export const BudgetEditCategories: React.FC<IProps> = ({
	categories,
	handleCloseEditCategories,
	budgetPlan,
},): React.JSX.Element => {
	const [categoryList, setCategoryList,] = React.useState<Array<IExpenseCategory>>(categories,)
	const [newCategoryList, setNewCategoryList,] = React.useState<Array<INewExpenseCategory>>([],)
	const [isCategoryCreating, setIsCategoryCreating,] = React.useState(false,)
	const [editIndex, setEditIndex,] = React.useState<string | undefined>(undefined,)
	const [editNewIndex, setEditNewIndex,] = React.useState<number | undefined>(undefined,)
	const [editCategory, setEditCategory,] = React.useState<IExpenseCategory | undefined>(undefined,)

	const {
		mutateAsync: updateAllCategories,
	} = useUpdateAllCategoriesByBudgetId(budgetPlan.id,)
	const {
		data: expenseCategoryList,
	} = useGetExpenseCategoryList(budgetPlan.clientId,)
	const initialValues = React.useMemo(() => {
		return categories
	},[categories,],)
	const totals = [...categoryList, ...newCategoryList,].reduce((sum, category,) => {
		return sum + (category.budget || 0)
	}, 0,)
	const editNewCategory = editNewIndex === undefined ?
		undefined :
		newCategoryList[editNewIndex]
	const toggleCreateCategoryVisible = toggleState(setIsCategoryCreating,)

	const handleCreateNew = (): void => {
		setEditIndex(undefined,)
		setEditNewIndex(undefined,)
		toggleCreateCategoryVisible()
	}
	const handleCancel = (): void => {
		setEditIndex(undefined,)
	}

	const handleCancelNew = (): void => {
		toggleCreateCategoryVisible()
		setEditNewIndex(undefined,)
	}
	const handleCancelEditNew = (): void => {
		setEditNewIndex(undefined,)
	}
	const handleDeleteCategory = (index: string,): void => {
		setCategoryList((prevState,) => {
			return prevState.filter((el,) => {
				return el.id !== index
			},)
		},)
	}
	const handleDeleteNewCategory = (index: number,): void => {
		setCategoryList((prevState,) => {
			return prevState.filter((el, i,) => {
				return i !== index
			},)
		},)
	}
	const handleEditNewClick = (index: number,): void => {
		setEditIndex(undefined,)
		setEditNewIndex(index,)
		setIsCategoryCreating(false,)
	}
	const handleEditClick = (index: string,): void => {
		setEditCategory(undefined,)
		setEditNewIndex(undefined,)
		setEditIndex(index,)
		setIsCategoryCreating(false,)
		const selectedCategory = categoryList.find((item,) => {
			return item.id === index
		},)
		if (selectedCategory) {
			setEditCategory(selectedCategory,)
		}
	}

	const categoryOptionsArray = React.useMemo(() => {
		return expenseCategoryList?.filter((expenseCategory,) => {
			return !categoryList.some((category,) => {
				return category.name === expenseCategory.name
			},)
		},
		)
			.filter((expenseCategory,) => {
				return !newCategoryList.some((category,) => {
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
	}, [expenseCategoryList, categoryList, newCategoryList,],)

	const handleCreateCategory = (data: INewExpenseCategory,): void => {
		if ((editIndex !== undefined)) {
			setCategoryList((prevState,) => {
				return prevState.map((category,) => {
					return (category.id === editIndex ?
						{
							...category, ...data, name: data.category,
						} :
						category)
				},
				)
			},)
		}
		setEditIndex(undefined,)
	}

	const handleCreateNewCategory = (data: INewExpenseCategory,): void => {
		setNewCategoryList((prevState,) => {
			if (editNewIndex !== undefined) {
				return prevState.map((category, index,) => {
					return (index === editNewIndex ?
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
		setEditNewIndex(undefined,)
	}
	const handleCreateCategories = async(): Promise<void> => {
		if (!budgetPlan.id) {
			return
		}
		await updateAllCategories({
			id:         budgetPlan.id,
			categories: [...categoryList, ...newCategoryList.map((category,) => {
				return {
					name:         category.category,
					budget:       Number(category.budget,),
					budgetPlanId: budgetPlan.id,
				}
			},),],
		},)
		handleCloseEditCategories()
	}

	const handleClear = (): void => {
		setNewCategoryList([],)
		setCategoryList(categories,)
	}
	return (
		<div className={styles.expenseCategoriesWrapper}>
			<div className={styles.addExpenseCategoryHeader}>
				<p className={styles.addExpenseCategoryTitle}>Edit expense categories</p>
			</div>
			<div className={styles.expenseCategoriesFormWrapper}>
				<p className={styles.managementAmount}><span>Total budget:</span> <span>$ {localeString(budgetPlan.totalManage, '', 2, true,)}</span></p>
				<div className={styles.categoryList}>
					{newCategoryList.map((category, index,) => {
						if (index === editNewIndex) {
							return (
								<React.Fragment key={index}>
									<NewExpenseCategory
										index={index}
										category={category}
										handleDeleteCategory={handleDeleteNewCategory}
										handleEditClick={handleEditNewClick}
										toggleCreateCategoryVisible={() => {
											setIsCategoryCreating(true,)
										}}
									/>
									<NewAddCategory
										cancelCreate={handleCancelEditNew}
										handleCreate={handleCreateNewCategory}
										categoryOptionsArray={categoryOptionsArray ?? []}
										editIndex={editNewIndex}
										editCategory={editNewCategory}
										clientId={budgetPlan.clientId}
									/>
								</React.Fragment>
							)
						}

						return (
							<NewExpenseCategory
								key={index}
								index={index}
								category={category}
								handleDeleteCategory={handleDeleteNewCategory}
								handleEditClick={handleEditNewClick}
								toggleCreateCategoryVisible={() => {
									setIsCategoryCreating(true,)
								}}
							/>
						)
					},)}
					{categoryList.map((category,) => {
						if (category.id === editIndex) {
							return (
								<React.Fragment key={category.id}>
									<ExpenseCategory
										id={category.id}
										category={category}
										handleDeleteCategory={handleDeleteCategory}
										handleEditClick={handleEditClick}
									/>
									<AddCategory
										cancelCreate={handleCancel}
										handleCreate={handleCreateCategory}
										categoryOptionsArray={categoryOptionsArray ?? []}
										editIndex={editIndex}
										editCategory={editCategory}
										clientId={budgetPlan.clientId}
									/>
								</React.Fragment>
							)
						}

						return (
							<ExpenseCategory
								key={category.id}
								id={category.id}
								category={category}
								handleDeleteCategory={handleDeleteCategory}
								handleEditClick={handleEditClick}
							/>
						)
					},)}
				</div>
				{isCategoryCreating && <NewAddCategory
					cancelCreate={handleCancelNew}
					handleCreate={handleCreateNewCategory}
					categoryOptionsArray={categoryOptionsArray ?? []}
					editIndex={editNewIndex}
					editCategory={editNewCategory}
					clientId={budgetPlan.clientId}
				/>}
				<div className={styles.addBlock}>
					<Button<ButtonType.TEXT>
						className={styles.addAnotherButton(!isCategoryCreating,)}
						onClick={handleCreateNew}
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
									$ {localeString(totals, '', 2, true,)}
						</p>
					</div>
				</div>
				{budgetPlan.totalManage < totals && <p className={styles.errorMessage}>Total allocated budget amount exceeds the management limit.</p>}
			</div>
			<div className={styles.addExpenseCategoryFooter}>
				<Button<ButtonType.TEXT>
					disabled={(isDeepEqual(initialValues,categoryList,) && Boolean(newCategoryList.length === 0,))}
					onClick={handleClear}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Clear',
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_GRAY,
						leftIcon: <Refresh/>,
					}}
				/>
				<Button<ButtonType.TEXT>
					disabled={(isDeepEqual(initialValues,categoryList,) && Boolean(newCategoryList.length === 0,))}
					onClick={handleCreateCategories}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Save edits',
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}