/* eslint-disable complexity */
import * as React from 'react'
import Slider from '@mui/material/Slider'
import {
	useRangeStore,
} from '../../../store/range-slider.store'
import {
	SliderSxStyles,
} from './range-slider.styles'
import {
	localeString,
} from '../../utils'
import * as styles from './range-slider.styles'

type TRangeProps = {
	onChange?: (value: Array<number | null> | undefined) => void
	propValue?: Array<number | null>
}

export const RangeSlider: React.FC<TRangeProps> = ({
	onChange,
	propValue,
},) => {
	const {
		value, setRange, maxValue,
	} = useRangeStore()
	React.useEffect(() => {
		if (propValue !== undefined) {
			setRange(propValue as Array<number> | null,)
		}
	}, [propValue,],)
	const handleChange = (event: Event, newValue: number | Array<number>,): void => {
		if (Array.isArray(newValue,)) {
			setRange(newValue,)
			if (onChange) {
				onChange(newValue,)
			}
		}
	}
	const rangeValue = value ?? [0, maxValue ?? 20000,]

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number,): void => {
		const inputValue = e.target.value.replace(/[$,]/g, '',)
		const numericValue = Number(inputValue,)
		if (!isNaN(numericValue,)) {
			const newValue = [...rangeValue,]
			newValue[index] = numericValue
			setRange(newValue,)
			if (onChange) {
				onChange(newValue,)
			}
		}
	}

	const getApproxMax = (max: number | undefined,): string => {
		if (!max) {
			return '0'
		}
		const magnitude = 10 ** (Math.floor(Math.log10(max,),) - 1)
		const roundedMax = Math.floor(max / magnitude,) * magnitude
		return `${localeString(roundedMax, '', 0, false,)}+`
	}

	return value && maxValue ?
		(
			<div className={styles.rangeSliderWrapper}>
				<p className={styles.totalAssetsText}>Total assets</p>
				<p className={styles.rangeSetInfo}>Set the min and max values below.</p>
				<div className={styles.sliderBlock}>
					<Slider
						value={value}
						onChange={handleChange}
						min={0}
						max={maxValue}
						sx={SliderSxStyles}
					/>
				</div>
				<div className={styles.valuesBlock}>
					<div>
						<p className={styles.minMaxText}>min</p>
						<input
							className={styles.valueWrapper(value[0] === 0,)}
							type='text'
							value={localeString(rangeValue[0] ?? 0,)}
							onChange={(e,) => {
								handleInputChange(e, 0,)
							}}
						/>
					</div>
					<div>
						<p className={styles.minMaxText}>max</p>
						<input
							className={styles.valueWrapper(value[1] === maxValue,)}
							type='text'
							placeholder={getApproxMax(rangeValue[1] ?? 0,)}
							value={
								maxValue === rangeValue[1] ?
									'' :
									localeString(rangeValue[1] ?? 0,)
							}
							onChange={(e,) => {
								handleInputChange(e, 1,)
							}}
						/>
					</div>
				</div>
			</div>
		) :
		(
			<p className={styles.rangeSetInfo}>No assets value to filter</p>
		)
}
