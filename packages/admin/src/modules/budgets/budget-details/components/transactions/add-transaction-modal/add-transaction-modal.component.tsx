import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	SelectComponent,
	Size,
} from '../../../../../../shared/components'
import categoriesIcon from '../../../../../../assets/images/categories-icon.png'
import type {
	IExpenseCategory,
} from '../../../../../../shared/types'
import type {
	IOptionType,
} from '../../../../../../shared/types'
import type {
	StoreTransactionListItem,
} from '../transactions.types'

import * as styles from './add-transaction-modal.styles'

interface IAddModalProps {
	onClose: () => void
	toggleAddTransaction: (body: IExpenseCategory) => void
	expenseCategories: Array<IExpenseCategory>
}

export const AddTransactionModal: React.FC<IAddModalProps> = ({
	onClose,
	toggleAddTransaction,
	expenseCategories,
},) => {
	const [selectValue, setSelectValue,] = React.useState<IOptionType<StoreTransactionListItem> | undefined>(undefined,)
	const handleContinue = (): void => {
		const category = expenseCategories.find((category,) => {
			return category.id === selectValue?.value.id
		},)
		if (category) {
			toggleAddTransaction(category,)
		}
		onClose()
	}

	const expenseOptionsArray = React.useMemo(() => {
		return expenseCategories
			.map((category,) => {
				return {
					label: category.name,
					value: {
						id:   category.id,
						name: category.name,
					},
				}
			},)
	}, [expenseCategories,],)
	return (
		<div className={styles.exitModalWrapper}>
			<img src={categoriesIcon} alt='categories' width={96} height={42}/>
			<h4>Select category</h4>
			<p>Please choose a category from the list to continue with transaction creation.</p>
			<SelectComponent<StoreTransactionListItem>
				isDisabled={!expenseOptionsArray}
				placeholder='Select category'
				key={expenseOptionsArray.toString()}
				options={expenseOptionsArray}
				onChange={(select,) => {
					if (select && !Array.isArray(select,)) {
						setSelectValue(select as IOptionType<StoreTransactionListItem>,)
					}
				}}
				value={selectValue}
				isSearchable
			/>
			<div className={styles.exitModalbuttonBlock}>
				<Button<ButtonType.TEXT>
					className={styles.viewDetailsButton}
					onClick={onClose}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Cancel',
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_COLOR,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={styles.addButton}
					onClick={handleContinue}
					disabled={!selectValue}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Continue',
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}