
import * as React from 'react'
import {
	cx,
} from '@emotion/css'

import type {
	BudgetPlanFormValues,
	StepType,
} from '../../../../budget/budget.types'
import {
	BudgetAccountCollapse,
} from './account-collapse.component'
import type {
	CurrencyList,
	IOptionType,
} from '../../../../../../shared/types'
import {
	useGetAllCurrencies,
} from '../../../../../../shared/hooks'
import {
	useBudgetStore,
} from '../../../budget.store'
import type {
	IAccountItem,
} from '../../../budget.types'

import * as styles from './styles'

interface IAddBudgetThirdStepProps {
	step: StepType
	values: BudgetPlanFormValues
	setBudgetPlanForm: React.Dispatch<React.SetStateAction<BudgetPlanFormValues>>
	accountsData: Array<IAccountItem>
	updateAccountData: (accountId: string, field: 'amount' | 'currency' | 'budget', value: string | IOptionType<CurrencyList>) => void;
	setAccountsData: React.Dispatch<React.SetStateAction<Array<IAccountItem>>>
}

export const AddBudgetThirdStep: React.FC<IAddBudgetThirdStepProps> = ({
	step,
	values,
	setBudgetPlanForm,
	accountsData,
	updateAccountData,
	setAccountsData,
},) => {
	const {
		setIsThirdStepValid, setTotalAmount, resetBudgetStore,
	} = useBudgetStore()
	const checkFormValidity = React.useCallback(() => {
		return accountsData.every((account,) => {
			return account.amount && account.currency && account.budget !== ''
		},)
	}, [accountsData,],)
	React.useEffect(() => {
		setIsThirdStepValid(checkFormValidity(),)
	}, [checkFormValidity,accountsData,],)

	const {
		data: currencyList,
	} = useGetAllCurrencies()
	React.useEffect(() => {
		const total = accountsData.reduce((sum, account,) => {
			const currency = currencyList?.find((c,) => {
				return c.currency === account.currency
			},)
			if (!currency) {
				return sum
			}

			const amount = parseFloat(account.amount ?? '0',)
			const convertedAmount = isNaN(amount,) ?
				0 :
				parseFloat((amount * currency.rate).toFixed(2,),)
			return sum + convertedAmount
		}, 0,)
		setTotalAmount(total,)

		return () => {
			resetBudgetStore()
		}
	}, [accountsData, currencyList,],)

	const currencyOptionsArray = currencyList?.map((currency,) => {
		return {
			label: currency.currency,
			value: currency.currency,
		}
	},) ?? []
	return (
		<div className={cx(styles.formStepWrapper, step !== 3 && 'hidden-el',)}>
			{values.accountIds?.map((account,) => {
				return <BudgetAccountCollapse
					key={account.value.id}
					account={account.value}
					accountData={accountsData.find((acc,) => {
						return acc.id === account.value.id
					},)}
					updateAccountData={updateAccountData}
					currencyOptionsArray={currencyOptionsArray}
				/>
			},)}
		</div>
	)
}