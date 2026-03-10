import React from 'react'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import type {
	MultiValue,
} from 'react-select'
import {
	cx,
} from '@emotion/css'
import {
	Button,
	ButtonType,
	Color,
	Size,
	SelectComponent,
} from '../../../../../shared/components'
import {
	BankSelect,
	PortfolioTypeIcon,
} from '../../../../../assets/icons'
import {
	useOrderStore,
} from '../order.store'
import type {
	IOptionType,
	OrderStatus,
	IOrder,
	IBank,
} from '../../../../../shared/types'
import {
	orderTypeOptions,
} from './orders-search.utils'
import {
	getSelectMultiLabelElement,
} from './orders-search.utils'
import {
	isDeepEqual,
} from '../../../../../shared/utils'
import {
	useOrdersList,
} from '../../../../../shared/hooks/orders/orders.hook'
import * as styles from './orders-filter.style'

interface IProps {
	children: React.ReactNode
	setDialogOpen: (value: boolean) => void
}

const initialFilterValues: TOrderSearch = {
	bankId:      undefined,
	statuses:    undefined,
}

type TOrderSearch = {
	bankId?: IOptionType<LinkedAccountType> | undefined
   statuses?: MultiValue<IOptionType<OrderStatus>> | undefined;
}

type LinkedAccountType = {
	id: string
	name: string
	bankId?: string
}

export const OrderFilterDialog: React.FC<IProps> = ({
	children,
	setDialogOpen,
},) => {
	const [orderFilter, setOrderFilter,] = React.useState<TOrderSearch>(initialFilterValues,)

	const {
		filter,
		setBankId,
		setStatuses,
	} = useOrderStore()

	const {
		data: ordersList,
	} = useOrdersList()

	const handleFilterApply = (filter: TOrderSearch,): void => {
		setBankId(filter.bankId?.value.id,)
		setStatuses(filter.statuses?.map((status,) => {
			return status.value
		},),)
	}

	const bankOptionsArray = React.useMemo(() => {
		const banks = ordersList?.list.flatMap((order: IOrder,) => {
			return order.request?.bank ?
				[order.request.bank,] :
				[]
		},) ?? []

		return Array.from(new Map(banks.map((bank: IBank,) => {
			return [bank.id, bank,]
		},),).values(),).map((bank,) => {
			return {
				label: bank.bankName,
				value: {
					id:   bank.id,
					name: bank.bankName,
				},
			}
		},)
	}, [ordersList,],)
	const content = (
		<div className={styles.filterDialogContainer}>
			<div className={styles.filterDialogWrapper}>
				<h3>Filter orders ({filter.type?.toLowerCase()})</h3>
				<SelectComponent<LinkedAccountType>
					options={bankOptionsArray}
					value={orderFilter.bankId ?? null}
					leftIcon={<BankSelect width={18} height={18} />}
					placeholder='Select bank'
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							setOrderFilter({
								...orderFilter,
								bankId:      select as IOptionType<LinkedAccountType>,
							},)
						}
					}}
					isDisabled={!bankOptionsArray}
				/>
				<SelectComponent<OrderStatus>
					options={orderTypeOptions}
					isMulti
					getMultiValueElement={getSelectMultiLabelElement}
					value={orderFilter.statuses}
					leftIcon={<PortfolioTypeIcon width={18} height={18} />}
					placeholder='Select statuses'
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setOrderFilter({
								...orderFilter,
								statuses:      select as MultiValue<IOptionType<OrderStatus>>,
							},)
						}
					}}
				/>
			</div>
			<div className={styles.filterBtnWrapper}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						setOrderFilter(initialFilterValues,)
						setBankId(undefined,)
						setStatuses(undefined,)
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
						handleFilterApply(orderFilter,)
						setDialogOpen(false,)
					}}
					disabled={isDeepEqual(orderFilter, initialFilterValues,)}
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
		>
			{children}
		</Popover>
	)
}