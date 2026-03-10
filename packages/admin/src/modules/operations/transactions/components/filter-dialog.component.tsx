import React from 'react'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'

import {
	Button,
	ButtonType,
	Color,
	Size,
	SelectComponent,
} from '../../../../shared/components'
import {
	BankSelect,
	Briefcase,
	ClientsRoute,
} from '../../../../assets/icons'

import {
	useGetTransactionTypeList,
	// useGetTransactionCategoryList,
	useGetAllCurrencies,
} from '../../../../shared/hooks'
import {
	useClientsList,
} from '../../../clients/client-profiles/clients/hooks'
import {
	usePortfolioListByClientId,
} from '../../../../shared/hooks/portfolio'
import {
	useBanksByPortfolioId,
} from '../../../../shared/hooks'
import {
	useTransactionStore,
} from '../transaction.store'
import type {
	LinkedTransactionType,
	TransactionSearch,
} from '../transaction.types'
import type {
	IOptionType,
} from '../../../../shared/types'
import {
	isDeepEqual,
} from '../../../../shared/utils'

import * as styles from '../transactions.styles'

interface IProps {
	children: React.ReactNode
	setDialogOpen: (value: boolean) => void
}

const initialFilterValues: TransactionSearch = {
	clientId:        undefined,
	portfolioId:     undefined,
	bankId:          undefined,
	transactionName: undefined,
	category:        undefined,
	currency:        undefined,
}

export const TransactionFilterDialog: React.FC<IProps> = ({
	children,
	setDialogOpen,
},) => {
	const [transactionFilter, setTransactionFilter,] = React.useState<TransactionSearch>(initialFilterValues,)
	const [key, setKey,] = React.useState(0,)

	const {
		setClientId,
		setPortfolioId,
		setBankId,
		setTransactionName,
		setCurrency,
	} = useTransactionStore()

	const {
		data: clientList,
	} = useClientsList()
	const {
		data: portfolioList,
	} = usePortfolioListByClientId(transactionFilter.clientId?.value.id,)
	const {
		data: bankList,
	} = useBanksByPortfolioId(transactionFilter.portfolioId?.value.id,)
	const {
		data: transactionTypeList,
	} = useGetTransactionTypeList()
	// todo: clear if good
	// const {
	// 	data: categoryList,
	// } = useGetTransactionCategoryList()
	const {
		data: currencyList,
	} = useGetAllCurrencies()

	const handleFilterApply = (filter: TransactionSearch,): void => {
		setClientId(filter.clientId?.value.id,)
		setPortfolioId(filter.portfolioId?.value.id,)
		setBankId(filter.bankId?.value.id,)
		setTransactionName(filter.transactionName?.value.id,)
		setCurrency(filter.currency?.value.name,)
	}

	const clientOptions = clientList?.list.map((client,) => {
		return {
			label: `${client.firstName} ${client.lastName}`,
			value: {
				id:   client.id,
				name: `${client.firstName} ${client.lastName}`,
			},
		}
	},) ?? []

	const portfolioOptions = portfolioList?.map((portfolio,) => {
		return {
			label: portfolio.name,
			value: {
				id:   portfolio.id,
				name: portfolio.name,
			},
		}
	},) ?? []

	const bankOptions = bankList?.map((bank,) => {
		return {
			label: bank.bankName,
			value: {
				id:   bank.id,
				name: bank.bankName,
			},
		}
	},) ?? []

	const transactionTypeOptions = transactionTypeList?.map((type,) => {
		return {
			label: type.name,
			value: {
				id:       type.id,
				name:     type.name,
				category: type.category,
			},
		}
	},) ?? []
	// todo: clear if good

	// const categoryOptions = categoryList?.map((option,) => {
	// 	return {
	// 		value: option,
	// 		label: option,
	// 	}
	// },) ?? []

	const currencyOptions = currencyList?.map((currency,) => {
		return {
			label: currency.currency,
			value: {
				id:   currency.id,
				name: currency.currency,
			},
		}
	},) ?? []
	// todo: clear if good

	// const getCategoryValue = (): IOptionType | undefined => {
	// 	if (transactionFilter.transactionName) {
	// 		const value = categoryOptions.find((option,) => {
	// 			return option.value === transactionFilter.transactionName?.value.category
	// 		},)
	// 		return value
	// 	}
	// 	return transactionFilter.category
	// }

	const content = (
		<div className={styles.filterDialogContainer}>
			<div className={styles.filterDialogWrapper}>
				<SelectComponent<LinkedTransactionType>
					key={`client-select-${key}`}
					options={clientOptions}
					value={transactionFilter.clientId}
					leftIcon={<ClientsRoute width={18} height={18} />}
					placeholder='Select clients'
					isDisabled={!clientList}
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							setTransactionFilter({
								...transactionFilter,
								portfolioId: undefined,
								bankId:      undefined,
								clientId:    select as IOptionType<LinkedTransactionType>,
							},)
						}
					}}
				/>
				<SelectComponent<LinkedTransactionType>
					key={`portfolio-select-${key}`}
					options={portfolioOptions}
					value={transactionFilter.portfolioId}
					leftIcon={<Briefcase width={18} height={18} />}
					placeholder='Select portfolio or sub-portfolio'
					isDisabled={!portfolioList}
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							setTransactionFilter({
								...transactionFilter,
								bankId:      undefined,
								portfolioId: select as IOptionType<LinkedTransactionType>,
							},)
						}
					}}
				/>
				<SelectComponent<LinkedTransactionType>
					key={`bank-select-${key}`}
					options={bankOptions}
					value={transactionFilter.bankId}
					leftIcon={<BankSelect width={18} height={18} />}
					placeholder='Select bank'
					isDisabled={!bankList}
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							setTransactionFilter({
								...transactionFilter,
								bankId: select as IOptionType<LinkedTransactionType>,
							},)
						}
					}}
				/>
				<SelectComponent<LinkedTransactionType>
					key={`name-select-${key}`}
					options={transactionTypeOptions}
					value={transactionFilter.transactionName}
					placeholder='Select name'
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							setTransactionFilter({
								...transactionFilter,
								transactionName: select as IOptionType<LinkedTransactionType>,
							},)
						}
					}}
				/>
				{/* todo: clear if good <SelectComponent
					key={`category-select-${key}`}
					options={categoryOptions}
					value={getCategoryValue()}
					placeholder='Select category'
					onChange={(value,) => {
						setTransactionFilter({
							...transactionFilter,
							category: value as IOptionType<string>,
						},)
					}}
					isDisabled
				/> */}
				<SelectComponent<LinkedTransactionType>
					key={`currency-select-${key}`}
					options={currencyOptions}
					value={transactionFilter.currency}
					placeholder='Select currency'
					isDisabled={!currencyList}
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							setTransactionFilter({
								...transactionFilter,
								currency: select as IOptionType<LinkedTransactionType>,
							},)
						}
					}}
				/>
			</div>
			<div className={styles.filterBtnWrapper}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						setKey((prevKey,) => {
							return prevKey + 1
						},)
						setTransactionFilter(initialFilterValues,)
						setClientId(undefined,)
						setPortfolioId(undefined,)
						setBankId(undefined,)
						setTransactionName(undefined,)
						setCurrency(undefined,)
					}}
					className={styles.clearBtn}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Clear',
						size:    Size.SMALL,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={() => {
						handleFilterApply(transactionFilter,)
						setDialogOpen(false,)
					}}
					disabled={isDeepEqual(transactionFilter, initialFilterValues,)}
					className={cx(styles.applyBtn, Classes.POPOVER_DISMISS,) }
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Apply',
						size:    Size.SMALL,
						color:   Color.BLUE,
					}}
				/>
			</div>
		</div>)

	return (
		<Popover
			usePortal={true}
			hasBackdrop={true}
			backdropProps={{
				className: styles.popoverBackdrop,
			}}
			placement='bottom-end'
			content={content}
			popoverClassName={styles.popoverContainer}
			onClosing={() => {
				setDialogOpen(false,)
			}}
			autoFocus={false}
			enforceFocus={false}
		>
			{children}
		</Popover>
	)
}