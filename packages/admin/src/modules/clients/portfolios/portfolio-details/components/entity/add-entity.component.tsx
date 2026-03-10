/* eslint-disable complexity */
import React from 'react'
import {
	useParams,
} from 'react-router-dom'
import {
	cx,
} from '@emotion/css'
import {
	Form,
} from 'react-final-form'
import type {
	FormApi,
} from 'final-form'

import {
	FormField,
	DocumentManager,
	SelectField,
	ButtonType,
	Button,
	Size,
	LabeledProgressBar,
	PrevButton,
	NextButton,
} from '../../../../../../shared/components'
import {
	Flag,
} from '../../../../../../assets/icons'
import {
	useCreateEntity,
} from '../../../../../../shared/hooks'
import {
	useCreateDocument,
} from '../../../../../../shared/hooks'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import type {
	EntityFormValues,
	StepType,
} from './add-entity.types'
import {
	validateAddEntityForm,
} from './add-entity.validator'
import {
	email,
} from '../../../../../../shared/utils/validators'
import {
	DocumentTypes,
} from '../../../../../../shared/types'
import {
	getEntityFormSteps,
} from './add-entity.utils'
import {
	filteredCountries,
} from '../../../../../../shared/constants'
import {
	useCreatedEntityStore,
} from './add-entity.store'
import * as styles from './entity.styles'

const countriesOptions = filteredCountries.map((name,) => {
	return {
		value: name,
		label: name,
	}
},)

type Props = {
	toggleEntityDialogVisible?: () => void
	onClose: () => void
}

export const AddEntity: React.FC<Props> = ({
	onClose, toggleEntityDialogVisible,
},) => {
	const {
		id, subportfolioId,
	} = useParams()
	const [step, setStep,] = React.useState<StepType>(1,)
	const {
		documents, addDocument, removeDocument, clearDocuments,
	} = useDocumentStore()
	const {
		mutateAsync: createEntity,
	} = useCreateEntity()
	const {
		mutateAsync: createEntityDocument,
	} = useCreateDocument(DocumentTypes.ENTITY,)
	const {
		setCreatedEntity,
	} = useCreatedEntityStore()

	const handleSubmit = async({
		authorizedSignatoryName, country, name, email, firstName, lastName,
	}: EntityFormValues, form: FormApi<EntityFormValues, Partial<EntityFormValues>>,): Promise<void> => {
		const newEntity = await createEntity({
			authorizedSignatoryName,
			name,
			email,
			firstName,
			lastName,
			country:     country?.value ?? '',
			portfolioId: subportfolioId ?? id,
		},)
		setCreatedEntity(newEntity,)
		if (documents.length > 0) {
			await Promise.all(documents.map(async(document,) => {
				const formData = new FormData()
				formData.append('file', document.file,)
				formData.append('type', document.documentType,)
				formData.append('entityId', newEntity.id,)
				await createEntityDocument(formData,)
			},),)
		}
		onClose()
		form.reset()
		clearDocuments()
		if (toggleEntityDialogVisible) {
			toggleEntityDialogVisible()
		}
	}
	return (
		<Form<EntityFormValues>
			onSubmit={handleSubmit}
			validate={validateAddEntityForm}
			render={({
				handleSubmit,
				submitting,
				errors,
				values,
			},) => {
				const firstStepDisabled = Boolean(errors?.['name'] || errors?.['country.value'],)
				const secondStepDisabled = Boolean(errors?.['authorizedSignatoryName'],)
				const thirdStepDisabled = Boolean(errors?.['email'] || errors?.['firstName'] || errors?.['lastName'],)

				return (
					<form className={styles.container} onSubmit={handleSubmit}>
						<h3 className={styles.header}>Add entity</h3>
						<LabeledProgressBar currentStep={step} steps={getEntityFormSteps(values,)}/>
						<div className={cx(styles.addFormEntityWrapper, step !== 1 && 'hidden-el',)}>
							<div className={styles.addInputBlock}>
								<FormField
									name='name'
									placeholder='Entity name'
								/>
								<SelectField
									name='country'
									placeholder='Select country'
									isMulti={false}
									options={countriesOptions}
									leftIcon={<Flag width={18} height={18} />}
									isSearchable
								/>
							</div>
							<div className={styles.addBtnWrapper}>
								<NextButton
									disabled={firstStepDisabled}
									handleNext={() => {
										setStep(2,)
									}}
								/>
							</div>
						</div>
						<div className={cx(styles.addFormEntityWrapper, step !== 2 && 'hidden-el',)}>
							<div className={styles.addInputBlock}>
								<FormField
									name='authorizedSignatoryName'
									placeholder='Authorized signatory name'
								/>
							</div>
							<div className={styles.addBtnWrapper}>
								<PrevButton
									handlePrev={() => {
										setStep(1,)
									}}
								/>
								<NextButton
									disabled={secondStepDisabled}
									handleNext={() => {
										setStep(3,)
									}}
								/>
							</div>
						</div>
						<div className={cx(styles.addFormEntityWrapper, step !== 3 && 'hidden-el',)}>
							<div className={styles.addInputBlock}>
								<FormField
									name='firstName'
									placeholder='First name'
								/>
								<FormField
									name='lastName'
									placeholder='Last name'
								/>
								<FormField
									name='email'
									placeholder='Email'
									validate={values.email?.trim() ?
										email :
										undefined}
								/>
							</div>
							<div className={styles.addBtnWrapper}>
								<PrevButton
									handlePrev={() => {
										setStep(2,)
									}}
								/>
								<NextButton
									disabled={thirdStepDisabled}
									handleNext={() => {
										setStep(4,)
									}}
								/>
							</div>
						</div>
						<div className={cx(styles.addFormEntityWrapper, step !== 4 && 'hidden-el',)}>
							<div className={styles.addInputBlock}>
								<DocumentManager
									documents={documents}
									addDocument={addDocument}
									removeDocument={removeDocument}
								/>
							</div>
							<div className={styles.addBtnWrapper}>
								<PrevButton
									handlePrev={() => {
										setStep(2,)
									}}
								/>
								<Button<ButtonType.TEXT>
									disabled={Boolean(submitting,)}
									type='submit'
									additionalProps={{
										btnType: ButtonType.TEXT,
										text:    'Add entity',
										size:    Size.MEDIUM,
									}}
								/>
							</div>
						</div>
					</form>
				)
			}
			}
		/>
	)
}