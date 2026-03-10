import React from 'react'

import {
	EmptyState, Plus,
} from '../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../shared/components'
import {
	Roles,
} from '../../../../shared/types'
import {
	useUserStore,
} from '../../../../store/user.store'

import * as styles from './table.style'

type Props = {
	toggleCreateVisible: () => void
}

export const TransactionTypeEmpty: React.FC<Props> = ({
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
		<div className={styles.emptyContainer}>
			<EmptyState width={164} height={164}/>
			<p className={styles.emptyText}>Nothing here yet. Add transaction to get started</p>
			{hasPermission && (
				<Button<ButtonType.TEXT>
					onClick={toggleCreateVisible}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add transaction',
						leftIcon: <Plus />,
						size:     Size.SMALL,
						color:    Color.BLUE,
					}}
				/>
			)}
		</div>
	)
}
