import React from 'react'
import {
	Outlet,
} from 'react-router-dom'

import {
	OperationsNavigation,
} from './components'

import * as styles from './operations.styles'

const OperationsLayout: React.FC = () => {
	return (
		<div className={styles.container}>
			<OperationsNavigation/>
			<Outlet/>
		</div>
	)
}

export default OperationsLayout
