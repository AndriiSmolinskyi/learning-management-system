import * as React from 'react'

import {
	Button, ButtonType, Color, Input, Size,
} from '../../../../../../shared/components'
import {
	SelectComponent,
} from '../../../../../../shared/components'
import type {
	AddCategoryItemValues,
	AddCategoryOptionType,
	IExpenseCategory,
} from '../add-expense-categories.types'
import type {
	IOptionType,
} from '../../../../../../shared/types'
import {
	CreatebleSelectEnum,
} from '../../../../../../shared/constants'
import {
	useCreateExpenseCategoryListItem,
} from '../../../../../../shared/hooks'

import * as styles from './styles'

interface IAddCategoryProps {
	cancelCreate: () => void
	handleCreate: (data: IExpenseCategory) => void
	categoryOptionsArray: Array<IOptionType<AddCategoryOptionType>>
	editIndex: number | undefined
	editCategory: IExpenseCategory | undefined
	clientId: string | undefined
}
const initialValues = {
	category: undefined,
	budget:   undefined,
}
export const AddCategory: React.FC<IAddCategoryProps> = ({
	cancelCreate,
	handleCreate,
	categoryOptionsArray,
	editIndex,
	editCategory,
	clientId,
},) => {
	const [categoryData, setCategoryData,] = React.useState<AddCategoryItemValues>(editCategory ?
		{
			budget:   String(editCategory.budget,), category: {
				label: editCategory.category, value: {
					id: editCategory.category, name: editCategory.category,
				},
			},
		} :
		initialValues,)
	const {
		mutateAsync: addExpenseCategoryItem,
		isPending: categoryAddLoading,
	} = useCreateExpenseCategoryListItem()

	const handleCreateExpenseCategory = async(name : string,): Promise<void> => {
		if (clientId) {
			await addExpenseCategoryItem({
				clientId,
				name,
			},)
		}
	}
	return (
		<div className={styles.newCategoryWrapper}>
			<p className={styles.blockTitle}>{editIndex ?
				'Edit expense category' :
				'Add expense category'}</p>
			<div className={styles.fieldBlock}>
				<p className={styles.fieldTitle}>Category</p>
				<SelectComponent<AddCategoryOptionType>
					options={categoryOptionsArray}
					value={categoryData.category}
					placeholder='Select or add a new category'
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							setCategoryData({
								...categoryData,
								category: select as IOptionType<AddCategoryOptionType>,
							},)
						}
					}}
					isCreateble
					createbleStatus={CreatebleSelectEnum.EXPENSE_CATEGORY}
					createFn={handleCreateExpenseCategory}
					isLoading={categoryAddLoading}
				/>
			</div>
			<div className={styles.fieldBlock}>
				<p className={styles.fieldTitle}>Allocated budget</p>
				<Input
					label=''
					isNumber
					touched
					input={{
						placeholder: 'Enter amount',
						value:       categoryData.budget ?? '',
						onChange:    (e,) => {
							// if ((/^\d*\.?\d*$/).test(e.target.value,)) {
							if (e.target.value === '' || (/^(0|[1-9]\d*)(\.\d*)?$/).test(e.target.value,)) {
								setCategoryData({
									...categoryData,
									budget: e.target.value,
								},)
							}
						},
					}}
				/>
			</div>
			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					className={styles.button}
					onClick={cancelCreate}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Cancel',
						size:     Size.SMALL,
						color:    Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					disabled={!categoryData.category?.value.name || !categoryData.budget}
					onClick={() => {
						if (!categoryData.category?.value.name || !categoryData.budget) {
							return
						}
						const body = {
							category: categoryData.category.value.name,
							budget:   Number(categoryData.budget,),
						}
						handleCreate(body,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Save',
						size:     Size.SMALL,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}