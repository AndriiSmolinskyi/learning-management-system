import React from 'react'

import * as styles from './connection-error.styles'

export const ConnectionErrorPage: React.FunctionComponent = () => {
	return <div className={styles.container}>
		<div className={styles.logo} >
			<p className={styles.logoText}>LMSs</p>
		</div>
		<p className={styles.errorMessage}>Connection error. Please check your internet connection and try again.</p>
	</div>
}