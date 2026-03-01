import React from 'react'
import {
	Line,
} from './line.component'
import {
	Button, ButtonType, Color, Size,
} from '../../../shared/components'
import {
	TOKEN_LINK,
} from '../token.constants'
import * as styles from './liveChart.style'

export const LiveChart: React.FC = () => {
	const handleBuyClick = (): void => {
		window.open(TOKEN_LINK, '_blank', 'noopener,noreferrer',)
	}

	return (
		<div className={styles.LiveChartWrapper} id='live'>
			<div className={styles.container}>
				<h2 className={styles.title}>LIVE CHART</h2>
				<Line className={styles.linesStyle} />
				<div className={styles.description}>
					<p>
						Drink, Buy and Pump it simultaneously. View live progression of PUMPPOLA live and be the part of it.
					</p>
				</div>
				<div className={styles.view}>
					<Button<ButtonType.TEXT>
						onClick={handleBuyClick}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'View on Pumpfun',
							size:     Size.LARGE,
							color:   Color.MAIN_COLOR,
						}}
					/>
				</div>
			</div>

		</div>
	)
}

