import React from 'react'
import {
	Flag,
	ChevronDown,
	ChevronUpBlue,
} from '../../../../../../assets/icons'
import {
	FormField,
	SelectField,
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	useEditClientStore,
} from '../../store/edit-client.store'
import type {
	IOptionType,
	SelectValueType,
} from '../../../../../../shared/types'
import {
	filteredCountries,
} from '../../../../../../shared/constants'
import * as styles from './edit-client.style'

type Props = {
	hasErrors: boolean
}

export const FifthStepEdit: React.FC<Props> = ({
	hasErrors,
},) => {
	const {
		values,
		setValues,
	} = useEditClientStore()

	const [isOpen, setIsOpen,] = React.useState(false,)

	const handleToggle = (): void => {
		setIsOpen((prevState,) => {
			return !prevState
		},)
	}

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
		<div className={styles.editFormItem({
			isActive: isOpen,
		},)}>
			<div className={styles.editFormItemHeader}>
				<div>
					<h5 className={styles.editFormItemTitle}>Billing infromation</h5>
					<p className={styles.editFormItemText}>
						{values.region}, {values.city}, {values.streetAddress}
					</p>
				</div>
				<Button<ButtonType.ICON>
					onClick={handleToggle}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.SMALL,
						icon:    isOpen ?
							(
								<ChevronUpBlue width={20} height={20} />
							) :
							(
								<ChevronDown width={20} height={20} />
							),
						color: Color.NONE,
					}}
				/>
			</div>

			{isOpen && (
				<div className={styles.editFormItemInputs}>
					<SelectField
						name='country'
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
			)}
		</div>
	)
}
