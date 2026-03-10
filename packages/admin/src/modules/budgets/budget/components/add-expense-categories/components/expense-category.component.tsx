import * as React from 'react'

import type {
	IExpenseCategory,
} from '../add-expense-categories.types'
import {
	ReactComponent as BucketIcon,
} from '../../../../../../assets/icons/delete-bucket.svg'
import {
	ReactComponent as EditIcon,
} from '../../../../../../assets/icons/pen-square.svg'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'
import {
	localeString,
} from '../../../../../../shared/utils'

import * as styles from './styles'

interface IAddExpenseCategoriesProps {
	category: IExpenseCategory
	handleDeleteCategory: (index: number) => void
	index: number
	handleEditClick: (index: number) => void
	toggleCreateCategoryVisible: () => void
}

export const ExpenseCategory: React.FC<IAddExpenseCategoriesProps> = ({
	category,
	handleDeleteCategory,
	index,
	handleEditClick,
	toggleCreateCategoryVisible,
},) => {
	return (
		<div className={styles.addedFieldWrapper}>
			<div>
				<p className={styles.customFieldText}>{String(category.category,)}</p>
				<p className={styles.customInfoText}>{String(localeString(category.budget, '', 2, true,),)} USD</p>
			</div>
			<div className={styles.iconButtonsBlockWrapper}>
				<Button<ButtonType.ICON>
					className={styles.fieldIconButton}
					onClick={() => {
						handleEditClick(index,)
					}}
					additionalProps={{
						btnType:  ButtonType.ICON,
						size:     Size.SMALL,
						color:    Color.NONE,
						icon:    <EditIcon width={18} height={18}/>,
					}}
				/>
				<Button<ButtonType.ICON>
					className={styles.fieldIconButton}
					onClick={() => {
						handleDeleteCategory(index,)
					}}
					additionalProps={{
						btnType:  ButtonType.ICON,
						size:     Size.SMALL,
						color:    Color.NONE,
						icon:    <BucketIcon width={18} height={18}/>,
					}}
				/>
			</div>
		</div>
	)
}