import * as React from 'react'

import {
	SelectField,
} from '../../../../../../../../shared/components'
import {
	useAddPortfolioStore,
} from '../../../../store/step.store'
import {
	StepProgressBar,
} from '../step-progress-bar/step-progress-bar.component'
import {
	assetArray,
} from './form-asset.constants'
import {
	DocumentManager,
} from '../../../../../../../../shared/components/document-manager/document-manager.component'
import {
	useDocumentStore,
} from '../../../../../../../../store/document.store'
import {
	renderStepTwoFormFields, renderSelectIcon,
} from './form-asset.utils'
import {
	getFormStepsBasedOnAssetType,
} from './form-asset.utils'
import type {
	IAssetValidateValues,
} from './form-asset.types'
import type {
	AssetNamesType,
} from '../../../../../../../../shared/types'
import {
	useForm, useFormState,
} from 'react-final-form'
import type {
	AssetFormValues,
} from '../../../../../../../clients/portfolios/portfolio-details/components/asset'

import * as styles from './form-asset.styles'

interface IFormAssetProps{
	values: IAssetValidateValues
}

export const FormAsset: React.FC<IFormAssetProps> = ({
	values,
},) => {
	const {
		subStep,
		accountId,
	} = useAddPortfolioStore()
	const steps = getFormStepsBasedOnAssetType(values,)
	const {
		documents, addDocument, removeDocument,
	} = useDocumentStore()
	const form = useForm()
	const {
		values: formValues,
	} = useFormState()

	React.useEffect(() => {
		if (subStep === 1) {
			Object.keys(formValues,).forEach((key,) => {
				form.change(key, undefined,)
			},)
			form.reset({
			},)
		}
	}, [subStep,],)
	return (
		<div>
			<StepProgressBar currentStep={subStep} steps={steps}/>
			{subStep === 1 && <div className={styles.formBankWrapper}>
				<SelectField<AssetNamesType>
					name='assetName'
					placeholder='Select asset'
					leftIcon={renderSelectIcon(values.assetName?.value,)}
					isMulti={false}
					options={assetArray}
					isCreateble={Boolean(true,)}
					isSearchable
					tabIndex={0}
				/>
			</div>}
			{subStep === 2 && renderStepTwoFormFields({
				assetName: values.assetName?.value,
				accountId: accountId ?? undefined,
				values:    formValues as AssetFormValues,
				step:      subStep,
			},)}
			{subStep === 3 && <div className={styles.formBankWrapper}>
				<DocumentManager
					documents={documents}
					addDocument={addDocument}
					removeDocument={removeDocument}
				/>
			</div>}
		</div>
	)
}