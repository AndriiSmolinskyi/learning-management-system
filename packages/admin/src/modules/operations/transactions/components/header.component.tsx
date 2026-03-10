import React from 'react'

import {
	Plus,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
} from '../../../../shared/components'
import {
	OperationsFilter,
} from '../../layout/components/filter/filter.component'
import {
	Roles,
} from '../../../../shared/types'
import {
	useUserStore,
} from '../../../../store/user.store'

import * as styles from '../transactions.styles'

type Props = {
	toggleCreateVisible: () => void
}

export const TransactionHeader: React.FC<Props> = ({
	toggleCreateVisible,
},) => {
	const [hasPermission, setHasPermission,] = React.useState<boolean>(false,)

	const {
		userInfo,
	} = useUserStore()

	React.useEffect(() => {
		const permission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		setHasPermission(permission,)
	}, [userInfo,],)

	return (
		<div className={styles.actionsContainer}>
			<div className={styles.actionsInner}>
				<OperationsFilter/>
				{hasPermission && (
					<Button<ButtonType.TEXT>
						onClick={toggleCreateVisible}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							leftIcon: <Plus />,
							text:     'Add transaction',
						}}
					/>
				)}
			</div>
		</div>
	)
}
