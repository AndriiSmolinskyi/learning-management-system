import React from 'react'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '..'
import {
	Rotate,
} from '../../../assets/icons'
import * as styles from './button-analytics.style'

type Props = {
	isLoading?: boolean
	handleClear?: () => void
	filter?: Record<string, unknown>
}

interface IFilterWithType {
  type?: unknown
  [key: string]: unknown
}

export const ButtonAnalyticsRealod: React.FC<Props> = ({
	isLoading,
	handleClear,
	filter,
},) => {
	const isFilterEmptyExceptType = (filter?: IFilterWithType,): boolean => {
		if (!filter) {
			return true
		}

		const {
			...rest
		} = filter
		delete rest.type

		return Object.values(rest,).every(
			(value,) => {
				return value === null || value === undefined || value === ''
			},
		)
	}

	const isDisabled = isFilterEmptyExceptType(filter,)

	return (
		<div className={styles.containerButtons}>
			{isLoading ?
				(
					<div className={styles.loaderWrapper}><div className={styles.loader}/></div>
				) :
				(
					<Button<ButtonType.ICON>
						onClick={handleClear}
						disabled={isDisabled}
						additionalProps={{
							btnType:  ButtonType.ICON,
							icon:     <Rotate width={20} height={20} />,
							size:     Size.SMALL,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>
				)}
		</div>
	)
}