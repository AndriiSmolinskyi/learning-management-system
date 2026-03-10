import * as React from 'react'

import {
	FormField,
	SelectField,
} from '../../../../../../../../../../shared/components'
import {
	requiredSelect,
	maxLengthValidator,
} from '../../../../../../../../../../shared/utils/validators'
import {
	useGetAllCurrenciesForCash,
} from '../../../../../../../../../../shared/hooks'

import type {
	CurrencyList,
} from '../../../../../../../../../../shared/types'

import * as styles from '../../form-asset.styles'
interface ICashProps {
	accountId?: string
}
export const CashContent: React.FC<ICashProps> = ({
	accountId,
},) => {
	const {
		data,
	} = useGetAllCurrenciesForCash(accountId,)

	const currencyOptions = data?.map((currency,) => {
		return {
			label: currency.currency,
			value: currency.currency,
		}
	},) ?? []

	return (
		<div className={styles.formBankWrapper}>
			<div>
				<p className={styles.fieldTitle}>Currency</p>
				<SelectField<CurrencyList>
					validate={requiredSelect}
					name='currency'
					placeholder='Select currency'
					isMulti={false}
					options={currencyOptions}
					isSearchable
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Comment</p>
				<FormField
					validate={maxLengthValidator(50,)}
					name='comment'
					placeholder=' Enter comment (optional)'
					tabIndex={0}
				/>
			</div>
		</div>
	)
}