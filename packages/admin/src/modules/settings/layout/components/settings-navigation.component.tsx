import React from 'react'
import {
	useNavigate, useParams, useLocation,
} from 'react-router-dom'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../shared/components'
import {
	RouterKeys,
} from '../../../../router/keys'
import {
	ChevronRight, TransactionSettings, Settings,
} from '../../../../assets/icons'
import * as styles from '../settings-layout.style'

export const SettingsNavigation: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const {
		id,
	} = useParams()
	const isOnTransactionsPage = location.pathname.includes(RouterKeys.SETTINGS_TRANSACTIONS,)
	const isOnRequestsDetailsPage = isOnTransactionsPage && Boolean(id,)

	return (
		<nav className={styles.pageHeader}>
			<Button<ButtonType.TEXT>
				className={styles.navigateBtn}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Settings',
					size:     Size.SMALL,
					color:    Color.NONE,
					leftIcon: <Settings className={styles.inactiveIcon} width={20} height={20} />,
				}}
				onClick={() => {
					navigate(RouterKeys.SETTINGS_TRANSACTIONS,)
				}}
			/>
			<ChevronRight width={20} height={20} />
			{isOnTransactionsPage && (
				<>
					<Button<ButtonType.TEXT>
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Transaction',
							size:     Size.SMALL,
							color:    isOnRequestsDetailsPage ?
								Color.NONE :
								Color.NON_OUT_BLUE,
							leftIcon:  isOnRequestsDetailsPage ?
								<TransactionSettings className={styles.inactiveIcon} width={20} height={20} /> :
								<TransactionSettings className={styles.activeIcon} width={20} height={20} />,
						}}
						onClick={() => {
							navigate(RouterKeys.SETTINGS_TRANSACTIONS,)
						}}
					/>
				</>
			)}
		</nav>
	)
}