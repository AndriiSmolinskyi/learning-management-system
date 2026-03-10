import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	SelectField,
	PrevButton,
	NextButton,
} from '../../../../../../shared/components'
import {
	SaveDraftButton,
} from './save-draft-button.component'
import {
	useAddClientStore,
} from '../../store'
import {
	Flag,
} from '../../../../../../assets/icons'
import type {
	IOptionType,
	SelectValueType,
} from '../../../../../../shared/types'
import {
	filteredCountries,
} from '../../../../../../shared/constants'

import * as styles from './add-client.styles'

type Props = {
	hasErrors: boolean
	onClose: () => void
}

export const FourthStep: React.FC<Props> = ({
	hasErrors, onClose,
},) => {
	const {
		values, setValues, step, setStep,
	} = useAddClientStore()

	const countriesArray = filteredCountries.map((name,) => {
		return {
			value: name,
			label: name,
		}
	},)

	const getSelectedCountry = (): IOptionType | undefined => {
		if (values.residence) {
			const country = countriesArray.find(
				(country,) => {
					return country.value === values.residence
				},
			)
			return country ?? undefined
		}
		return undefined
	}

	const handleChange = (
		e: SelectValueType,
	): void => {
		if (e) {
			if ('value' in e) {
				setValues({
					residence: e.value,
				},)
			}
			if (Array.isArray(e,) && e.length > 0) {
				setValues({
					residence: e[0].value,
				},)
			}
		}
	}

	return (
		<div className={cx(step !== 4 && 'hidden-el',)}>
			<div className={styles.inputBlock}>
				<SelectField
					name='residence'
					placeholder='Select country'
					isSearchable
					isMulti={false}
					value={getSelectedCountry()}
					options={countriesArray}
					leftIcon={<Flag width={18} height={18} />}
					onChange={handleChange}
				/>
			</div>

			<div className={styles.btnsContainer}>
				<SaveDraftButton onClose={onClose} />
				<div className={styles.btnsLeft}>
					<PrevButton handlePrev={() => {
						setStep(3,)
					}} />
					<NextButton
						disabled={hasErrors}
						handleNext={() => {
							setStep(5,)
						}}
					/>
				</div>
			</div>
		</div>
	)
}
