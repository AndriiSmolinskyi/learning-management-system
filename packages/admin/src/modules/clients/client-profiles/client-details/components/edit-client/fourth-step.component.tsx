import React from 'react'
import {
	SelectField,
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	useEditClientStore,
} from '../../store/edit-client.store'
import {
	ChevronDown,
	ChevronUpBlue,
	Flag,
} from '../../../../../../assets/icons'
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

export const FourthStepEdit: React.FC<Props> = () => {
	const {
		values, setValues,
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
		<div className={styles.editFormItem({
			isActive: isOpen,
		},)}>
			<div className={styles.editFormItemHeader}>
				<div>
					<h5 className={styles.editFormItemTitle}>Residence</h5>
					<p className={styles.editFormItemText}>{values.residence}</p>
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
			)}
		</div>
	)
}
