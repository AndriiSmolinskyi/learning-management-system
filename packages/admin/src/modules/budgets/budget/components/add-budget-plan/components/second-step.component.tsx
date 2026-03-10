
import * as React from 'react'
import {
	cx,
} from '@emotion/css'

import {
	SelectField,
} from '../../../../../../shared/components'
import type {
	BudgetPlanFormValues,
	StepType,
} from '../../../../budget/budget.types'
import type {
	BudgetClientListType,
} from '../../../../budget/budget.types'
import type {
	IOptionType,
} from '../../../../../../shared/types'
import {
	BankSelect,
	AccountIcon,
} from '../../../../../../assets/icons'
import {
	useGetAccountsBySourceIds,
	useBanksByClientId,
} from '../../../../../../shared/hooks'

import * as styles from './styles'

interface IAddBudgetSecondStepProps {
	step: StepType
	values: BudgetPlanFormValues
	setBudgetPlanForm: React.Dispatch<React.SetStateAction<BudgetPlanFormValues>>
}

export const AddBudgetSecondStep: React.FC<IAddBudgetSecondStepProps> = ({
	step,
	values,
	setBudgetPlanForm,
},) => {
	const {
		data: bankList,
	} = useBanksByClientId(values.clientId?.value.id ?? '',)
	const bankIds = values.bankIds?.map((bank,) => {
		return bank.value
	},) ?? []
	const {
		data: accountList,
	} = useGetAccountsBySourceIds({
		bankIds,
	},)
	const bankListOptions = React.useMemo(() => {
		return bankList?.map((bank,) => {
			return {
				label: `${bank.bankName} (${bank.branchName})`,
				value: bank.id,
			}
		},) ?? []
	},
	[bankList,],)

	const accountListOptions = React.useMemo(() => {
		const bankMap = new Map(bankList?.map((bank,) => {
			return [bank.id, `${bank.bankName} (${bank.branchName})`,]
		},),)
		const existingAccountIds = new Set(values.accountIds?.map((item,) => {
			return item.value.id
		},),)
		return accountList?.filter(
			(account, index, self,) => {
				return index === self.findIndex((a,) => {
					return a.id === account.id
				},)
			},
		).map((account, index,) => {
			return {
				label: account.accountName,
				value: {
					id:       account.id,
					name:     account.accountName,
					bankId:   account.bankId,
					bankName: `${bankMap.get(account.bankId,)}`,
				},
			}
		},)
			.filter((account,) => {
				return !existingAccountIds.has(account.value.id,)
			},) ??
		[]
	},
	[accountList,],)
	return (
		<div className={cx(styles.formStepWrapper, step !== 2 && 'hidden-el',)}>
			<div>
				<p className={styles.collapseAmountCurrencyText}>Banks</p>
				<SelectField
					name='bankIds'
					isDisabled={!values.clientId?.value.id}
					placeholder='Select banks'
					leftIcon={<BankSelect width={18} height={18} />}
					options={bankListOptions}
					onChange={(selectedBanks,) => {
						if (Array.isArray(selectedBanks,)) {
							const selectedBankIds = selectedBanks.map((bank,) => {
								return bank.value
							},)
							const filteredAccountIds = (values.accountIds ?? []).filter((account,) => {
								return account.value.bankId && selectedBankIds.includes(account.value.bankId,)
							},)
							setBudgetPlanForm({
								...values,
								bankIds:    selectedBanks,
								accountIds: filteredAccountIds.length > 0 ?
									filteredAccountIds :
									undefined,
							},)
						}
					}}
					value={values.bankIds}
					isSearchable
					isMulti
				/>
			</div>
			<div>
				<p className={styles.collapseAmountCurrencyText}>Accounts</p>
				<SelectField<BudgetClientListType>
					name='accountIds'
					isDisabled={!accountList}
					placeholder='Select bank accounts'
					leftIcon={<AccountIcon width={18} height={18} />}
					options={accountListOptions}
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setBudgetPlanForm({
								...values,
								accountIds:    select as Array<IOptionType<BudgetClientListType>>,
							},)
						}
					}}
					value={values.accountIds}
					isMulti
					isSearchable
				/>
			</div>

		</div>
	)
}