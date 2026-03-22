/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable complexity */
import React from 'react'
import {
	Form,
} from 'react-final-form'
import {
	cx,
} from '@emotion/css'

import {
	Button,
	ButtonType,
	Dialog,
	FormField,
	LabeledProgressBar,
	NextButton,
	PrevButton,
	Size,
	PhoneField,
} from '../../../shared/components'
import {
	useCreateStudent,
} from '../../../shared/hooks/students/students.hooks'
import {
	ExitStudentUnsavedDialog,
} from './exit-unsaved-dialog.component'
import {
	validateStudentForm,
} from '../utils/add-student.validator'
import {
	getStudentFormSteps,
} from '../utils/students.utils'

import type {
	IStudentFormValues,
} from '../students.types'
import * as styles from './add-students.style'

type Props = {
	onClose: (id?: number) => void
	toggleSuccessDialogVisible: () => void
	toggleExitDialogVisible: () => void
	handleCloseSaveExit: () => void
	isExitDialogOpen: boolean
}

type StepType = 1 | 2 | 3 | 4

const INITIAL_VALUES: IStudentFormValues = {
	firstName:   '',
	lastName:    '',
	email:       '',
	phoneNumber: '',
	country:     '',
	city:        '',
	comment:     '',
}

export const AddStudents: React.FC<Props> = ({
	onClose,
	toggleSuccessDialogVisible,
	toggleExitDialogVisible,
	handleCloseSaveExit,
	isExitDialogOpen,
},) => {
	const [step, setStep,] = React.useState<StepType>(1,)

	const {
		mutateAsync: createStudent,
		isPending,
	} = useCreateStudent()

	return (
		<Form<IStudentFormValues>
			onSubmit={async(values, form,) => {
				try {
					await createStudent({
						firstName:   (values.firstName ?? '').trim(),
						lastName:    (values.lastName ?? '').trim(),
						email:       (values.email ?? '').trim(),
						phoneNumber: (values.phoneNumber ?? '').trim() || undefined,
						country:     (values.country ?? '').trim() || undefined,
						city:        (values.city ?? '').trim() || undefined,
						comment:     (values.comment ?? '').trim() || undefined,
					},)

					form.reset()
					setStep(1,)
					handleCloseSaveExit()
					onClose()
					toggleSuccessDialogVisible()
				// eslint-disable-next-line no-empty
				} catch {

				}
			}}
			validate={validateStudentForm}
			initialValues={INITIAL_VALUES}
			render={({
				handleSubmit,
				submitting,
				errors,
				values,
				hasValidationErrors,
				form,
			},) => {
				const firstName = (values.firstName ?? '').trim()
				const lastName = (values.lastName ?? '').trim()
				const email = (values.email ?? '').trim()
				const phoneNumber = (values.phoneNumber ?? '').trim()
				const country = (values.country ?? '').trim()
				const city = (values.city ?? '').trim()
				const comment = (values.comment ?? '').trim()

				const isFormEmpty = !firstName &&
					!lastName &&
					!email &&
					!phoneNumber &&
					!country &&
					!city &&
					!comment

				const firstStepDisabled = Boolean(
					errors?.['firstName'] ||
					errors?.['lastName'],
				) || !firstName || !lastName

				const secondStepDisabled = Boolean(errors?.['email'],) || !email

				const thirdStepDisabled = Boolean(errors?.['phoneNumber'],)

				const submitDisabled = Boolean(hasValidationErrors,) || submitting || isPending

				return (
					<form className={styles.formContainer} onSubmit={handleSubmit}>
						<h3 className={styles.formHeader}>Add student</h3>

						<LabeledProgressBar
							currentStep={step}
							steps={getStudentFormSteps(values,)}
						/>

						<div className={cx(styles.addFormWrapper,)}>
							<div className={cx(step !== 1 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>First name</p>
										<FormField
											name='firstName'
											placeholder='Enter first name'
										/>
									</div>

									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>Last name</p>
										<FormField
											name='lastName'
											placeholder='Enter last name'
										/>
									</div>
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

							<div className={cx(step !== 2 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>Email</p>
										<FormField
											name='email'
											placeholder='Enter email'
										/>
									</div>
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

							<div className={cx(step !== 3 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>Phone number</p>
										<PhoneField
											name='phoneNumber'
											placeholder='Enter phone number'
										/>
									</div>
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

							<div className={cx(step !== 4 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>Country</p>
										<FormField
											name='country'
											placeholder='Enter country'
										/>
									</div>

									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>City</p>
										<FormField
											name='city'
											placeholder='Enter city'
										/>
									</div>

									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>Comment (optional)</p>
										<FormField
											name='comment'
											placeholder='Enter comment'
										/>
									</div>
								</div>

								<div className={styles.addBtnWrapper}>
									<PrevButton
										handlePrev={() => {
											setStep(3,)
										}}
									/>
									<Button<ButtonType.TEXT>
										type='submit'
										disabled={submitDisabled}
										additionalProps={{
											btnType: ButtonType.TEXT,
											text:    isPending ?
												'Creating...' :
												'Add student',
											size:    Size.MEDIUM,
										}}
									/>
								</div>
							</div>
						</div>

						<Dialog
							onClose={toggleExitDialogVisible}
							open={isExitDialogOpen}
							isCloseButtonShown
							backdropClassName={styles.exitDialogBackdrop}
						>
							<ExitStudentUnsavedDialog
								onExit={() => {
									form.reset()
									setStep(1,)
									handleCloseSaveExit()
									onClose()
								}}
								disabled={isFormEmpty}
							/>
						</Dialog>
					</form>
				)
			}}
		/>
	)
}