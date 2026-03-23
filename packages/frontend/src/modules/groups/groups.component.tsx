import React from 'react'
import {
	Header,
} from './components/header.component'
import List from './components/list.component'
import * as styles from './groups.styles'

export const Groups: React.FC = () => {
	return (
		<div className={styles.pageWrapper}>
			<Header />
			<List/>
		</div>
	)
}

export default Groups