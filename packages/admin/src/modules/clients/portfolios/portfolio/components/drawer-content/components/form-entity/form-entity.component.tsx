import * as React from 'react'

import {
	FormField,
	SelectField,
	DocumentManager,
} from '../../../../../../../../shared/components'
import {
	useAddPortfolioStore,
} from '../../../../store/step.store'
import {
	Flag,
} from '../../../../../../../../assets/icons'
import {
	useDocumentStore,
} from '../../../../../../../../store/document.store'
import {
	getEntityFormSteps,
} from '../../../../utils/get-entity-step-value.util'
import {
	StepProgressBar,
} from '../step-progress-bar/step-progress-bar.component'
import {
	maxLengthValidator,
	required,
	requiredSelect,
	alphanumericValidator,
} from '../../../../../../../../shared/utils/validators'
import {
	emailNotRequired,
} from './form-entity.validate'
import {
	composeValidators,
} from '../../../../../../../../shared/utils'
import {
	filteredCountries,
} from '../../../../../../../../shared/constants'

import type {
	IEntityValidateValues,
} from './form-entity.types'

import * as styles from './form-entity.styles'

interface IFormEntityProps {
	values: IEntityValidateValues
}

export const FormEntity: React.FC<IFormEntityProps> = ({
	values,
},) => {
	const {
		subStep,
	} = useAddPortfolioStore()
	const steps = getEntityFormSteps(values,)
	const countriesArray = filteredCountries.map((name,) => {
		return {
			value: name,
			label: name,
		}
	},)
	const {
		documents, addDocument, removeDocument,
	} = useDocumentStore()
	return (
		<div>
			<StepProgressBar currentStep={subStep} steps={steps}/>
			{subStep === 1 && <div className={styles.formEntityWrapper}>
				<FormField
					validate={composeValidators(required, maxLengthValidator(50,),alphanumericValidator,)}
					name='entityName'
					placeholder='Entity name'
				/>
				<SelectField
					validate={requiredSelect}
					name='country'
					placeholder='Select country'
					isSearchable
					isMulti={false}
					options={countriesArray}
					leftIcon={<Flag width={18} height={18} />}
				/>
			</div>}
			{subStep === 2 && <div className={styles.formEntityWrapper}>
				<FormField
					validate={composeValidators(required, maxLengthValidator(50,),alphanumericValidator,)}
					name='authorizedSignatoryName'
					placeholder='Authorized signatory name'
				/>
			</div>}
			{subStep === 3 && <div className={styles.formEntityWrapper}>
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
			{subStep === 4 && <div className={styles.formEntityWrapper}>
				<DocumentManager
					documents={documents}
					addDocument={addDocument}
					removeDocument={removeDocument}
				/>
			</div>}
		</div>
	)
}