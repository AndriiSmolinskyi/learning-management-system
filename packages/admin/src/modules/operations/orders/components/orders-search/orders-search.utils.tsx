import {
	OrderStatus,
} from '../../../../../shared/types'
import type {
	IOptionType,
} from '../../../../../shared/types'
import type {
	MultiValueProps,
} from 'react-select'
import React from 'react'
import {
	Label,
} from '../../../../../shared/components'
import {
	getoOrderStatus,
} from '../orders-utils'

export const orderTypeOptions: Array<IOptionType<OrderStatus>> = [
	{
		label: OrderStatus.IN_PROGRESS,
		value: OrderStatus.IN_PROGRESS,
	},
	{
		label: OrderStatus.APPROVED,
		value: OrderStatus.APPROVED,
	},
	{
		label: OrderStatus.CANCELED,
		value: OrderStatus.CANCELED,
	},

]

export const getSelectMultiLabelElement = (props: MultiValueProps<IOptionType<OrderStatus>, boolean>,): React.ReactNode => {
	return (
		<Label
			{...props.removeProps}
			color={getoOrderStatus(props.data.value,)}
			label={props.data.value}
		/>)
}