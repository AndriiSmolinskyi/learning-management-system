import * as React from 'react'

import {
	FormField,
	SelectField,
	DocumentManager,
} from '../../../../../../../../shared/components'
import {
	PortfolioTypeIcon,
} from '../../../../../../../../assets/icons'
import {
	useAddPortfolioStore,
} from '../../../../store/step.store'
import {
	addPortfolioFormSteps,
} from '../../../../utils/get-portfolio-step-value.util'
import {
	Flag,
} from '../../../../../../../../assets/icons'
import {
	useDocumentStore,
} from '../../../../../../../../store/document.store'
import {
	portfolioTypesArray,
} from './form-portfolio.constants'
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
	composeValidators,
} from '../../../../../../../../shared/utils'
import {
	filteredCountries,
} from '../../../../../../../../shared/constants'

import type {
	IPortfolioFormValues,
} from './form-portfolio.types'

import * as styles from './form-portfolio.styles'

interface IFormPortfolioProps {
	values: IPortfolioFormValues
}
export const FormPortfolio: React.FC<IFormPortfolioProps> = ({
	values,
},) => {
	const {
		subStep,
	} = useAddPortfolioStore()
	const countriesArray = filteredCountries.map((name,) => {
		return {
			value: name,
			label: name,
		}
	},)
	const {
		documents, addDocument, removeDocument,
	} = useDocumentStore()
	const steps = addPortfolioFormSteps(values,)
	return (
		<div>
			<StepProgressBar currentStep={subStep} steps={steps}/>
			{subStep === 1 && <div className={styles.formPortfolioWrapper}>
				<FormField
					validate={composeValidators(required, maxLengthValidator(50,),alphanumericValidator,)}
					name='portfolioName'
					placeholder='Portfolio name'
				/>
				<SelectField
					validate={requiredSelect}
					name='portfolioType'
					placeholder='Select portfolio type'
					isMulti={false}
					options={portfolioTypesArray}
					isBadges={true}
					leftIcon={<PortfolioTypeIcon width={18} height={18} />}
					isSearchable
				/>
			</div>}
			{subStep === 2 && <div className={styles.formPortfolioWrapper}>
				<div>
					<p className={styles.fieldTitle}>Resident</p>
					<SelectField
						name='resident'
						placeholder='Select resident'
						isSearchable
						isMulti={false}
						options={countriesArray}
						leftIcon={<Flag width={18} height={18} />}
					/>
				</div>
				<div>
					<p className={styles.fieldTitle}>Tax Resident</p>
					<SelectField
						name='taxResident'
						placeholder='Select tax resident'
						isMulti={false}
						isSearchable
						options={countriesArray}
						leftIcon={<Flag width={18} height={18} />}
					/>
				</div>

			</div>}
			{subStep === 3 && <div className={styles.formPortfolioWrapper}>
				<DocumentManager
					documents={documents}
					addDocument={addDocument}
					removeDocument={removeDocument}
				/>
			</div>}
		</div>
	)
}