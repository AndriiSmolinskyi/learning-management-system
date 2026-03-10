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
} from '../../../../budget/components/add-expense-categories/add-expense-categories.types'
import type {
	IOptionType,
} from '../../../../../../shared/types'
import {
	CreatebleSelectEnum,
} from '../../../../../../shared/constants'
import type {
	IExpenseCategory,
} from '../../../../../../shared/types'
import type {
	INewExpenseCategory,
} from '../edit-categories.types'
import {
	useCreateExpenseCategoryListItem,
} from '../../../../../../shared/hooks'

import * as styles from './styles'

interface IAddCategoryProps {
	cancelCreate: () => void
	handleCreate: (data: INewExpenseCategory) => void
	categoryOptionsArray: Array<IOptionType<AddCategoryOptionType>>
	editIndex: string | undefined
	editCategory: IExpenseCategory | undefined
	clientId: string
}

export const AddCategory: React.FC<IAddCategoryProps> = ({
	cancelCreate,
	handleCreate,
	categoryOptionsArray,
	editIndex,
	editCategory,
	clientId,
},) => {
	const [categoryData, setCategoryData,] = React.useState<AddCategoryItemValues | undefined>(undefined,)
	React.useEffect(() => {
		if (editCategory) {
			setCategoryData({
				budget:   String(editCategory.budget,), category: {
					label: editCategory.name, value: {
						id: editCategory.id, name: editCategory.name,
					},
				},
			},)
		}
	}, [editCategory,],)

	const {
		mutateAsync: addExpenseCategoryItem,
		isPending: categoryAddLoading,
	} = useCreateExpenseCategoryListItem()

	const handleCreateExpenseCategory = async(name : string,): Promise<void> => {
		await addExpenseCategoryItem({
			clientId,
			name,
		},)
	}
	return (
		<div className={styles.newCategoryWrapper}>
			<p className={styles.blockTitle}>{editIndex ?
				'Edit category' :
				'Add category'}</p>
			<div className={styles.fieldBlock}>
				<p className={styles.fieldTitle}>Category</p>
				<SelectComponent<AddCategoryOptionType>
					options={categoryOptionsArray}
					value={categoryData?.category ?? undefined}
					placeholder='Select or add a new category'
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							setCategoryData((prev,) => {
								return {
									...prev,
									budget:   prev?.budget ?? undefined,
									category: select as IOptionType<AddCategoryOptionType>,
								}
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
					isNumber={true}
					label=''
					touched
					input={{
						placeholder: 'Enter amount',
						value:       categoryData?.budget ?? '',
						onChange:    (e,) => {
							// if ((/^\d*\.?\d*$/).test(e.target.value,)) {
							if (e.target.value === '' || (/^(0|[1-9]\d*)(\.\d*)?$/).test(e.target.value,)) {
								setCategoryData((prev,) => {
									return {
										...prev,
										budget:   e.target.value,
										category: prev?.category ?? undefined,
									}
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
					disabled={!categoryData?.category?.value.name || !categoryData.budget}
					onClick={() => {
						if (!categoryData?.category?.value.name || !categoryData.budget) {
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