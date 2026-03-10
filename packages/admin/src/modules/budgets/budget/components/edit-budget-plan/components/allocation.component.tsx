/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */

import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../../../shared/components'

import {
	ChevronDown,
} from '../../../../../../assets/icons'
import type {
	BudgetClientListType,
} from '../../../budget.types'
import {
	Collapse,
} from '@blueprintjs/core'
import Input from '../../../../../../shared/components/input/input.component'
import {
	BankSelect,
} from '../../../../../../assets/icons'
import {
	SelectComponent,
} from '../../../../../../shared/components'
import {
	CurrencyList,
} from '../../../../../../shared/types'
import type {
	IOptionType,
} from '../../../../../../shared/types'
import {
	Check, CheckNegative,
} from '../../../../../../assets/icons'
import {
	useGetAccountAssetsTotalById,
} from '../../../../../../shared/hooks'
import {
	localeString,
} from '../../../../../../shared/utils'

import * as styles from '../../../components/add-budget-plan/components/styles'

interface IBudgetAccountCollapseProps {
	account: BudgetClientListType
	updateAccountData: (accountId: string, field: 'amount' | 'currency' | 'budget', value: string | IOptionType<CurrencyList>) => void;
	currencyOptionsArray: Array<IOptionType<CurrencyList>>
}

export const BudgetAccountCollapse: React.FC<IBudgetAccountCollapseProps> = ({
	account,
	updateAccountData,
	currencyOptionsArray,
},) => {
	const [isOpen, setIsOpen,] = React.useState<boolean>(false,)
	const handleOpen = (): void => {
		setIsOpen(!isOpen,)
	}
	const {
		data: accountTotal,
	} = useGetAccountAssetsTotalById(account.id,)
	const isAccountValid = account.amount !== undefined && account.amount !== '' && account.currency !== undefined && Boolean(account.budget,)
	const initialCurrency = {
		label: CurrencyList.USD,
		value: CurrencyList.USD,
	}
	return (
		<div className={styles.accountCollapseWrapper(isOpen, (isAccountValid),)}>
			<div className={styles.collapseNameButtonBlock}>
				<div className={styles.collapseNamesBlock}>
					<p className={styles.collapseBankNameBlock}>
						<BankSelect width={16} height={16}/>
						<span className={styles.collapseBankName}>{account.bankName}
						</span>
					</p>
					<p className={styles.collapseAccountName}>
						{isOpen ?
							null :
							(
								isAccountValid ?
									<Check width={18} height={18} /> :
									<CheckNegative width={18} height={18} />
							)}

						{isOpen && <span className={styles.collapseAccountIndicatorWrapper}>
							<span className={styles.collapseAccountIndicator(isOpen, (isAccountValid),)}/>
						</span>}
						{account.name}
					</p>
				</div>
				<Button<ButtonType.ICON>
					className={styles.collapseAccountChevronIcons(isOpen,)}
					additionalProps={{
						btnType:  ButtonType.ICON,
						icon:     <ChevronDown width={20} height={20}/>,
						size:     Size.MEDIUM,
						color:    Color.NONE,
					}}
					onClick={handleOpen}
				/>
			</div>
			<Collapse isOpen={isOpen}>
				<div className={styles.collapse}>
					<div>
						<p className={styles.collapseAmountCurrencyText}>Expected Monthly Bank Income</p>
						<Input
							isNumber={true}
							label=''
							input={{
								placeholder: 'Enter amount',
								value:       account.budget ?? '',
								onChange:    (e,) => {
									if ((/^\d*\.?\d*$/).test(e.target.value,)) {
										updateAccountData(account.id, 'budget', e.target.value,)
										updateAccountData(account.id, 'amount', accountTotal?.totalAssets ?
											String(accountTotal.totalAssets,) :
											'0',)
										updateAccountData(account.id, 'currency', initialCurrency as IOptionType<CurrencyList>,)
									}
								},
							}}
						/>
					</div>
					<div>
						<p className={styles.collapseAmountCurrencyText}>Amount</p>
						<Input
							isNumber={true}
							label=''
							readOnly
							input={{
								placeholder: 'Enter amount',
								value:       account.amount ?
									localeString(Number(account.amount,), 'USD', 2, true,) :
									localeString(Number(accountTotal?.totalAssets,), 'USD', 2, true,),
								onChange:    (e,) => {
									if ((/^\d*\.?\d*$/).test(e.target.value,)) {
										updateAccountData(account.id, 'amount', e.target.value,)
									}
								},
							}}
						/>
					</div>
					<div>
						<p className={styles.collapseAmountCurrencyText}>Currency</p>
						<SelectComponent
							placeholder='Select currency'
							isDisabled
							value={currencyOptionsArray.find((option,) => {
								return option.value === account.currency
							},) ?? initialCurrency}
							options={currencyOptionsArray}
							onChange={(select,) => {
								if (select && !Array.isArray(select,)) {
									updateAccountData(account.id, 'currency', select as IOptionType<CurrencyList>,)
								}
							}}
						/>
					</div>
				</div>
			</Collapse>
		</div>
	)
}
