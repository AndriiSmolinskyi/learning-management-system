import React from 'react'
import {
	Outlet,
} from 'react-router-dom'
import {
	SettingsNavigation,
} from './components/settings-navigation.component'
import * as styles from './settings-layout.style'

const SettingsLayout: React.FC = () => {
	return (
		<div className={styles.container}>
			<SettingsNavigation/>
			<Outlet/>
		</div>
	)
}

export default SettingsLayout
