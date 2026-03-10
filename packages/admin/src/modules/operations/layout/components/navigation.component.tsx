/* eslint-disable complexity */
import React from 'react'
import {
	useLocation,
	useNavigate,
	useParams,
} from 'react-router-dom'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	ChevronRight,
	ListChecks,
	OrdersIcon,
	RequestIcon,
	Send,
} from '../../../../assets/icons'

import {
	RouterKeys,
} from '../../../../router/keys'

import * as styles from '../operations.styles'

export const OperationsNavigation: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const {
		id,
	} = useParams()
	const isOnRequestsPage = location.pathname.includes(RouterKeys.REQUESTS,)
	const isOnOrdersPage = location.pathname.includes(RouterKeys.ORDERS,)
	const isOnTransactionsPage = location.pathname.includes(RouterKeys.TRANSACTIONS,)
	const isOnRequestsDetailsPage = isOnRequestsPage && Boolean(id,)
	const isOnOrdersDetailsPage = isOnRequestsPage && Boolean(id,)
	const isOnTransactionsDetailsPage = isOnRequestsPage && Boolean(id,)

	return (
		<nav className={styles.pageHeader}>
			<Button<ButtonType.TEXT>
				className={styles.navigateBtn}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Operations',
					size:     Size.SMALL,
					color:    Color.NONE,
					leftIcon: <ListChecks className={styles.inactiveIcon} width={20} height={20} />,
				}}
				onClick={() => {
					navigate(RouterKeys.REQUESTS,)
				}}
			/>
			<ChevronRight width={20} height={20} />
			{isOnRequestsPage && (
				<>
					<Button<ButtonType.TEXT>
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Requests',
							size:     Size.SMALL,
							color:    isOnRequestsDetailsPage ?
								Color.NONE :
								Color.NON_OUT_BLUE,
							leftIcon:  isOnRequestsDetailsPage ?
								<RequestIcon className={styles.inactiveIcon} width={20} height={20} /> :
								<RequestIcon className={styles.activeIcon} width={20} height={20} />,
						}}
						onClick={() => {
							navigate(RouterKeys.REQUESTS,)
						}}
					/>
				</>
			)}
			{isOnOrdersPage && (
				<>
					<Button<ButtonType.TEXT>
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Orders',
							size:     Size.SMALL,
							color:    isOnOrdersDetailsPage ?
								Color.NONE :
								Color.NON_OUT_BLUE,
							leftIcon:  isOnOrdersDetailsPage ?
								<OrdersIcon className={styles.inactiveIcon} width={20} height={20} /> :
								<OrdersIcon width={20} height={20} />,
						}}
						onClick={() => {
							navigate(RouterKeys.ORDERS,)
						}}
					/>
				</>
			)}
			{isOnTransactionsPage && (
				<>
					<Button<ButtonType.TEXT>
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Transactions',
							size:     Size.SMALL,
							color:    isOnTransactionsDetailsPage ?
								Color.NONE :
								Color.NON_OUT_BLUE,
							leftIcon:  isOnTransactionsDetailsPage ?
								<Send className={styles.inactiveIcon} width={20} height={20} /> :
								<Send width={20} height={20} />,
						}}
						onClick={() => {
							navigate(RouterKeys.TRANSACTIONS,)
						}}
					/>
				</>
			)}
		</nav>
	)
}