import React from 'react'

type Props = {
	children: React.ReactNode
}

import * as styles from '../cash.styles'

export const TableWrapper: React.FC<Props> = ({
	children,
},) => {
	return (
		<div className={styles.tableWrapper}>
			{children}
		</div>
	)
}