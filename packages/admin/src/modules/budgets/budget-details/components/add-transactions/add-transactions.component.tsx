
import * as React from 'react'
import {
	Form,
} from 'react-final-form'

import {
	Button, ButtonType, Color, SelectField, Size,
} from '../../../../../shared/components'
import type {
	IExpenseCategory,
} from '../../../../../shared/types'
import {
	useGetTransactionTypeList,
	useLinkTransactionTypes,
} from '../../../../../shared/hooks'
import type {
	LinkedTransactionType,
	AddTransactionFormValues,
} from './add-transaction.types'
import {
	PortfolioTypeIcon,
} from '../../../../../assets/icons'
import {
	validateAddTransactionForm,
} from './add-transaction.validator'
import {
	isDeepEqual,
} from '../../../../../shared/utils'

import * as styles from './add-transactions.styles'

interface IProps {
	expenseCategory: IExpenseCategory
	onClose: () => void
}
export const AddTransaction: React.FC<IProps> = ({
	expenseCategory,
	onClose,
},): React.JSX.Element => {
	const {
		data: transactionTypeList,
	} = useGetTransactionTypeList()
	const {
		mutateAsync: linkTransactions,
	} = useLinkTransactionTypes()

	const transactionTypeOptions = transactionTypeList?.map((type,) => {
		return {
			label: type.name,
			value: {
				id:       type.id,
				name:     type.name,
			},
		}
	},) ?? []

	const initialFormValues = React.useMemo(() => {
		return {
			transactionTypes: expenseCategory.transactionTypes.map((item,) => {
				return {
					label: item.name,
					value: {
						id:   item.id,
						name: item.name,
					},
				}
			},),
		}
	}, [expenseCategory,],)

	const handleSubmit = async(values: AddTransactionFormValues,): Promise<void> => {
		const transactionTypes = values.transactionTypes.map((item,) => {
			return item.value.name
		},)
		await linkTransactions({
			expenseCategoryId: expenseCategory.id,
			transactionTypes,
		},)
		onClose()
	}

	return (
		<Form<AddTransactionFormValues>
			onSubmit={handleSubmit}
			validate={validateAddTransactionForm}
			initialValues={initialFormValues}
			render={({
				handleSubmit,
				values,
				form,
				hasValidationErrors,
				submitting,
			},) => {
				const isEqual = isDeepEqual(values, initialFormValues,)
				return (
					<form onSubmit={handleSubmit} className={styles.addTransactionWrapper}>
						<div className={styles.header}>
							<p className={styles.headerTitle}>Add transaction</p>
						</div>
						<div className={styles.mainBlock}>
							<div className={styles.allocatedBlock}>
								<p className={styles.categoryName}>Category: {expenseCategory.name}</p>
								<p className={styles.budgetBlock}>
									<span>
						Allocated budget:
									</span>
									<span>
						$ {expenseCategory.budget}
									</span>
								</p>

							</div>
							<SelectField<LinkedTransactionType>
								name='transactionTypes'
								placeholder='Select type'
								leftIcon={<PortfolioTypeIcon/>}
								options={transactionTypeOptions}
								value={values.transactionTypes}
								isSearchable
								isMulti
								onChange={(select,) => {
									if (select && Array.isArray(select,)) {
										form.change('transactionTypes', select,)
									}
								}}
							/>
						</div>

						<div className={styles.footer}>
							<Button<ButtonType.TEXT>
								type='submit'
								disabled={hasValidationErrors || submitting || isEqual}
								additionalProps={{
									btnType:  ButtonType.TEXT,
									text:     'Add transaction',
									size:     Size.MEDIUM,
									color:    Color.BLUE,
								}}
							/>
						</div>
					</form>
				)
			}}
		/>
	)
}