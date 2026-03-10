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
} from '../../../../budget/budget.types'
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
import type {
	IAccountItem,
} from '../../../budget.types'
import type {
	IOptionType,
} from '../../../../../../shared/types'
import {
	CurrencyList,
} from '../../../../../../shared/types'
import {
	Check, CheckNegative,
} from '../../../../../../assets/icons'
import {
	useGetAccountAssetsTotalById,
} from '../../../../../../shared/hooks'

import * as styles from './styles'

interface IBudgetAccountCollapseProps {
	account: BudgetClientListType
	accountData?: IAccountItem
	updateAccountData: (accountId: string, field: 'amount' | 'currency' | 'budget', value: string | IOptionType<CurrencyList>) => void;
	currencyOptionsArray: Array<IOptionType<CurrencyList>>
}

export const BudgetAccountCollapse: React.FC<IBudgetAccountCollapseProps> = ({
	account,
	accountData,
	updateAccountData,
	currencyOptionsArray,
},) => {
	const [isOpen, setIsOpen,] = React.useState<boolean>(false,)
	const [isAccountValid, setIsAccountValid,] = React.useState<boolean>(false,)
	const handleOpen = (): void => {
		setIsOpen(!isOpen,)
	}
	const {
		data: accountTotal,
	} = useGetAccountAssetsTotalById(account.id,)
	React.useEffect(() => {
		setIsAccountValid(accountData?.amount !== undefined &&
			accountData.amount !== '' &&
			accountData.currency !== undefined &&
			accountData.budget !== undefined &&
			accountData.budget !== '',)
	}, [accountData,],)
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
								value:       accountData?.budget ?? '',
								onChange:    (e,) => {
									if ((/^\d*\.?\d*$/).test(e.target.value,)) {
										updateAccountData(account.id, 'budget', e.target.value,)
										updateAccountData(account.id, 'amount', accountTotal?.totalAssets ?
											String(accountTotal.totalAssets,) :
											'',)
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
							readOnly
							label=''
							input={{
								placeholder: 'Enter amount',
								value:       accountTotal?.totalAssets?.toFixed(2,) ?? accountData?.amount ?? '',
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
							value={initialCurrency}
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
