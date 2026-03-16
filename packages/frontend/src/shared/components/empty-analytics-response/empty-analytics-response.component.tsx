/* eslint-disable complexity */
import * as React from 'react'
import {
	cx,
} from '@emotion/css'
import Button from '../button/button.component'
import {
	ButtonType, Color, Size,
} from '../button'
import emptyStateImage from '../../../assets/images/empty-state-without-background.png'
import emptyFilterImage from '../../../assets/images/not-found-without-backgrond.png'

import * as styles from './empty-analytics-response.styles'

type Props = {
	className?: string
	wrapperClassName?: string
	iconClassName?: string
	inTable?: boolean
	isFilter?: boolean
	clearFunction?: () => void
	isAdditionalText?: boolean
	customText?: string
}

export const EmptyAnalyticsResponse: React.FunctionComponent<Props> = ({
	className,
	inTable = false,
	wrapperClassName,
	isFilter,
	clearFunction,
	isAdditionalText,
	iconClassName,
	customText,
},) => {
	return (inTable ?
		<tbody>
			<tr>
				<td>
					{isFilter ?
						<div className={cx(styles.wrapper,wrapperClassName,)}>
							<div className={styles.emptyContainer}>
								<img src={emptyFilterImage} alt='empty-filter' className={cx(styles.image, iconClassName,)}/>
								{isAdditionalText ?
									<p className={styles.emptyText}>Negative amounts could not be represented on charts</p> :
									<p className={styles.emptyText}>No results found. Try a different search or filter</p>}
								{clearFunction && <Button<ButtonType.TEXT>
									disabled={false}
									onClick={clearFunction}
									additionalProps={{
										btnType:  ButtonType.TEXT,
										text:     'Clear',
										size:     Size.SMALL,
										color:    Color.SECONDRAY_GRAY,
									}}
								/>}
							</div>
						</div> :
						<div className={cx(styles.wrapper,wrapperClassName,)}>
							<div className={styles.emptyContainer}>
								<img src={emptyStateImage} alt='empty-state' className={cx(styles.image, iconClassName,)}/>
								{isAdditionalText ?
									<p className={styles.emptyText}>Negative amounts could not be represented on charts</p> :
									<p className={styles.emptyText}>Currently you don't have this asset type in portfolio</p>}
							</div>
						</div>

					}
				</td>
			</tr>
		</tbody>	:
		<div className={cx(styles.wrapper, wrapperClassName,)}>
			{isFilter ?
				<div className={styles.emptyContainer}>
					<img src={emptyFilterImage} alt='empty-filter' className={cx(styles.image, iconClassName,)}/>
					{isAdditionalText ?
						<p className={styles.emptyText}>Negative amounts could not be represented on charts</p> :
						<p className={styles.emptyText}>No results found. Try a different search or filter</p>}
					{clearFunction && <Button<ButtonType.TEXT>
						disabled={false}
						onClick={clearFunction}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Clear',
							size:     Size.SMALL,
							color:    Color.SECONDRAY_GRAY,
						}}
					/>}
				</div> :
				<div className={styles.emptyContainer}>
					<img src={emptyStateImage} alt='empty-state' className={cx(styles.image, iconClassName,)}/>
					{isAdditionalText ?
						<p className={styles.emptyText}>Negative amounts could not be represented on charts</p> :
						<p className={styles.emptyText}>
							{customText ?
								customText :
								'Currently you dont have this asset type in portfolio'}
						</p>}
				</div>
			}
		</div>
	)
}