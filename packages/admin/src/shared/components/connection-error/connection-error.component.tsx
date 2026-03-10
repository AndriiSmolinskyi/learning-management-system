import React from 'react'
import {
	Migdal,
} from '../../../assets/icons'

import * as styles from './connection-error.styles'

export const ConnectionErrorPage: React.FunctionComponent = () => {
	return <div className={styles.container}>
		<div className={styles.logo} >
			<Migdal height={48} />
			<p className={styles.logoText}>Migdal Management Analytics</p>
		</div>
		<p className={styles.errorMessage}>Connection error. Please check your internet connection and try again.</p>
	</div>
}