import * as React from 'react'
import {
	cx,
} from '@emotion/css'
import type {
	Property,
} from 'csstype'

import * as styles from './loader.styles'

type Props = {
	className?: string
	wrapperClassName?: string
	width?: number
	radius?: number
	position?: Property.Position
	inTable?: boolean
}

export const Loader: React.FunctionComponent<Props> = ({
	className,
	width = 200,
	radius = 8,
	position = 'absolute',
	inTable = false,
	wrapperClassName,
},) => {
	return (inTable ?
		<tbody>
			<tr>
				<td>
					<div
						className={cx(styles.loaderWrapper, wrapperClassName,)}
					>
						<div className={cx(styles.loader({
							width, radius, position,
						},), className,)} />
					</div>
				</td>
			</tr>
		</tbody>	:
		<div className={cx(styles.loaderWrapper, wrapperClassName,)}>
			<div className={cx(styles.loader({
				width, radius, position,
			},), className,)} />
		</div>
	)
}