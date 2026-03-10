import React from 'react'
import {
	cx,
} from '@emotion/css'

type Props = {
	children: React.ReactNode
	className?: string
}

import * as styles from '../overview.styles'

export const TableWrapper: React.FC<Props> = ({
	children,
	className,
},) => {
	return (
		<div className={cx(styles.tableWrapper, className,)}>
			{children}
		</div>
	)
}