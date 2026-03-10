
import * as React from 'react'

import type {
	PortfolioChartFilterEnum,
} from '../../../../../../../../services/portfolio'
import {
	filterButtons,
} from '../../analytics.constants'
import {
	Button, ButtonType,
	Color,
	Size,
} from '../../../../../../../../shared/components'

import * as styles from './button-block.styles'

interface IProps {
	selected: PortfolioChartFilterEnum
	handleClick: (id: PortfolioChartFilterEnum) => void
}
export const PortfolioAnalyticsButtonBlock: React.FC<IProps> = ({
	selected,
	handleClick,
},) => {
	return (
		<div className={styles.buttonsWrapper}>
			{filterButtons.map(({
				id, label, icon,
			},) => {
				return (
					<Button<ButtonType.TEXT>
						key={id}
						onClick={() => {
							handleClick(id,)
						}}
						className={styles.filterButton(selected === id,)}
						additionalProps={{
							btnType:   ButtonType.TEXT,
							text:      label,
							rightIcon: icon,
							size:      Size.SMALL,
							color:     selected === id ?
								Color.BLUE :
								Color.NONE,
						}}
					/>
				)
			},)}
		</div>

	)
}