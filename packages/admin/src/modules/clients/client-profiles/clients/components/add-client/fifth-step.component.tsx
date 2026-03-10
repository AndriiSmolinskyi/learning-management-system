import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Flag,
} from '../../../../../../assets/icons'
import {
	FormField,
	PrevButton,
	NextButton,
} from '../../../../../../shared/components'

import {
	SaveDraftButton,
} from './save-draft-button.component'
import {
	SelectField,
} from '../../../../../../shared/components'
import {
	useAddClientStore,
} from '../../store'
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

export const FifthStep:React.FC<Props> = ({
	hasErrors, onClose,
},) => {
	const {
		values,
		setValues,
		step,
		setStep,
	} = useAddClientStore()

	const countriesArray = filteredCountries.map((name,) => {
		return {
			value: name,
			label: name,
		}
	},)

	const getSelectedCountry = (): IOptionType | undefined => {
		if (values.country) {
			const country = countriesArray.find(
				(country,) => {
					return country.value === values.country
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
					country: e.value,
				},)
			}
			if (Array.isArray(e,) && e.length > 0) {
				setValues({
					country: e[0].value,
				},)
			}
		}
	}

	return (
		<div className={cx((step !== 5) && 'hidden-el',)}>
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
				<FormField
					name='region'
					placeholder='Region'
					value={values.region}
					onChange={(e,) => {
						setValues({
							region: e.target.value,
						},)
					}}
				/>
				<FormField
					name='city'
					placeholder='City'
					value={values.city}
					onChange={(e,) => {
						setValues({
							city: e.target.value,
						},)
					}}
				/>
				<FormField
					name='streetAddress'
					placeholder='Street address'
					value={values.streetAddress}
					onChange={(e,) => {
						setValues({
							streetAddress: e.target.value,
						},)
					}}
				/>
				<FormField
					name='buildingNumber'
					placeholder='Building number'
					value={values.buildingNumber}
					onChange={(e,) => {
						setValues({
							buildingNumber: e.target.value,
						},)
					}}
				/>
				<FormField
					name='postalCode'
					placeholder='Postal code'
					value={values.postalCode}
					onChange={(e,) => {
						setValues({
							postalCode: e.target.value,
						},)
					}}
				/>
			</div>

			<div className={styles.btnsContainer}>
				<SaveDraftButton onClose={onClose}/>
				<div className={styles.btnsLeft}>
					<PrevButton handlePrev={() => {
						setStep(4,)
					}} />
					<NextButton
						disabled={hasErrors}
						handleNext={() => {
							setStep(6,)
						}}
					/>
				</div>
			</div>
		</div>
	)
}