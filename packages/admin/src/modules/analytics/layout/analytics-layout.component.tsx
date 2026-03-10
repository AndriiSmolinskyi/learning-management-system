import React from 'react'
import {
	Outlet,
	useNavigate,
} from 'react-router-dom'

import {
	AnalyticsNavigation,
} from './components'

import {
	useUserStore,
} from '../../../store/user.store'
import {
	RouterKeys,
} from '../../../router/keys'
import {
	STORAGE_KEYS, storageService,
} from '../../../services/storage'
import {
	Roles,
} from '../../../shared/types'

import * as styles from './analytic-layout.styles'

const AnalyticsLayout: React.FC = () => {
	const navigate = useNavigate()
	const {
		userInfo,
	} = useUserStore()
	React.useLayoutEffect(() => {
		const hasStorePermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,].includes(role,)
		},)
		const storageRoles = storageService.getItem<Array<string>>(STORAGE_KEYS.ROLES,)
		const hasStoragePermission = storageRoles?.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,].includes(role,)
		},)
		if (!hasStorePermission && !hasStoragePermission) {
			navigate(RouterKeys.PORTFOLIO,)
		}
	}, [],)

	return (
		<div className={styles.container}>
			<AnalyticsNavigation/>
			<Outlet/>
		</div>
	)
}

export default AnalyticsLayout
