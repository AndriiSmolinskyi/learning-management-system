import React from 'react'
import type {
	Placement,
} from '@blueprintjs/core'
import {
	Tooltip as TooltipComponent,
} from '@blueprintjs/core'

import {
	tooltip,
} from './tooltip.styles'

type Props = {
	children: React.ReactNode
	text: string
	placement?: Placement
	icon?: React.ReactElement
}

export const Tooltip: React.FC<Props> = ({
	children,
	text,
	placement = 'right',
	icon,
},) => {
	return (
		<TooltipComponent
			placement={placement}
			popoverClassName={tooltip}
			content={<span>{text}</span>}
			minimal
		>
			<span style={{
				display: 'inline-flex', alignItems: 'center', outline: 'none',
			}}>
				{children}
				{icon && <span style={{
					marginLeft: 4,
				}}>{icon}</span>}
			</span>
		</TooltipComponent>
	)
}