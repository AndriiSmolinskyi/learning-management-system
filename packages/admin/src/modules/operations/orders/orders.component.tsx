import React from 'react'
import {
	OrdersHeader,
} from './components/orders-header.component'
import {
	OrdersList,
} from './components/orders-list/orders-list.component'
import * as styles from './orders.styles'

const Orders: React.FC = () => {
	return (
		<div className={styles.container}>
			<OrdersHeader />
			<OrdersList />
		</div>
	)
}

export default Orders
