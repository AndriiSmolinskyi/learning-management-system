import React from 'react'
import {
	Book,
} from '../../../assets/icons'
import * as styles from './header.styles'

type HeaderProps = {
	some?: () => void
}

export const Header: React.FC<HeaderProps> = ({
	some,
},) => {
	return (
		<div className={styles.headerWrapper}>
			<div className={styles.titleIconBlock}>
				<Book width={32} height={32} />
				<p className={styles.headerTitle}>Groups</p>
			</div>
		</div>
	)
}