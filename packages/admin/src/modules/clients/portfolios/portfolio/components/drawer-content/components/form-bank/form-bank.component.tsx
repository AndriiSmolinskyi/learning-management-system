import * as React from 'react'

import {
	FormField,
	SelectField,
} from '../../../../../../../../shared/components'
import {
	useAddPortfolioStore,
} from '../../../../store/step.store'
import {
	Flag,
} from '../../../../../../../../assets/icons'
import {
	getBankFormSteps,
} from '../../../../utils/get-bank-step-value.util'
import {
	StepProgressBar,
} from '../step-progress-bar/step-progress-bar.component'
import {
	useCreateBankListItem,
	useGetBankList,
} from '../../../../../../../../shared/hooks/list-hub'
import {
	CreatebleSelectEnum,
} from '../../../../../../../../shared/constants/createble-select.constants'
import {
	maxLengthValidator,
	required,
	requiredSelect,
	alphanumericValidator,
	requiredSelectObject,
} from '../../../../../../../../shared/utils/validators'
import {
	emailNotRequired,
} from '../form-entity'
import {
	composeValidators,
} from '../../../../../../../../shared/utils'
import {
	filteredCountries,
} from '../../../../../../../../shared/constants'
import type {
	SelectOptionType,
} from '../../../../../../../../shared/types'

import type {
	IBankValidateValues,
} from './form-bank.types'

import * as styles from './form-bank.styles'

interface IFormBankProps{
	values: IBankValidateValues
}
export const FormBank: React.FC<IFormBankProps> = ({
	values,
},) => {
	const {
		data: bankList,
	} = useGetBankList()
	const {
		subStep,
	} = useAddPortfolioStore()
	const {
		mutateAsync: addBankItem,
		isPending: bankAddLoading,
	} = useCreateBankListItem()
	const handleCreateBank = async(name : string,): Promise<void> => {
		await addBankItem({
			name,
		},)
	}
	const steps = getBankFormSteps(values,)
	const countriesArray = filteredCountries.map((name,) => {
		return {
			value: name,
			label: name,
		}
	},)
	const updatedBankList = bankList?.map((type,) => {
		return {
			label: type.name,
			value: {
				name: type.name,
				id:   type.id,
			},
		}
	},)
	return (
		<div>
			<StepProgressBar currentStep={subStep} steps={steps}/>
			{subStep === 1 && <div className={styles.formBankWrapper}>
				<SelectField<SelectOptionType>
					validate={requiredSelectObject}
					name='bankName'
					placeholder='Select or add new bank'
					isMulti={false}
					options={updatedBankList ?? []}
					isCreateble
					isSearchable
					createbleStatus={CreatebleSelectEnum.BANK}
					createFn={handleCreateBank}
					isLoading={bankAddLoading}
				/>
			</div>}
			{subStep === 2 && <div className={styles.formBankWrapper}>
				<div>
					<p className={styles.fieldTitle}>Location</p>
					<SelectField
						validate={requiredSelect}
						name='country'
						placeholder='Select country'
						isSearchable
						isMulti={false}
						options={countriesArray}
						leftIcon={<Flag width={18} height={18} />}
					/>
				</div>
				<div>
					<p className={styles.fieldTitle}>Branch name</p>
					<FormField
						validate={composeValidators(required, maxLengthValidator(50,),alphanumericValidator,)}
						name='branchName'
						placeholder='Enter branch name'
					/>
				</div>

			</div>}
			{subStep === 3 && <div className={styles.formBankWrapper}>
				<FormField
					validate={composeValidators(maxLengthValidator(50,),alphanumericValidator,)}
					name='firstName'
					placeholder='First name'
				/>
				<FormField
					validate={composeValidators(maxLengthValidator(50,),alphanumericValidator,)}
					name='lastName'
					placeholder='Last name'
				/>
				<FormField
					validate={emailNotRequired}
					name='email'
					placeholder='Email'
				/>
			</div>}
		</div>
	)
}