/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-negated-condition */
/* eslint-disable complexity */
import React from 'react'
import {
	Form,
} from 'react-final-form'

import {
	Button,
	ButtonType,
	Dialog,
	FormField,
	LabeledProgressBar,
	NextButton,
	PrevButton,
	Size,
	CustomDatePickerField,
} from '../../../shared/components'
import {
	useCreateGroup,
} from '../../../shared/hooks/groups/groups.hook'
import {
	ExitGroupUnsavedDialog,
} from './exit-unsaved-dialog.component'
import {
	validateGroupForm,
} from '../utils/add-group.validator'
import {
	getGroupFormSteps,
} from '../utils/groups.utils'
import {
	validateDate,
} from '../../../shared/utils/validators'
import type {
	IGroupFormValues,
} from '../groups.types'
import * as styles from './add-groups.style'

type Props = {
	onClose: () => void
	toggleSuccessDialogVisible: () => void
	toggleExitDialogVisible: () => void
	handleCloseSaveExit: () => void
	isExitDialogOpen: boolean
}

const INITIAL_VALUES: IGroupFormValues = {
	groupName:  '',
	courseName: '',
	startDate:  null,
	comment:    '',
}

export const AddGroups: React.FC<Props> = ({
	onClose,
	toggleSuccessDialogVisible,
	toggleExitDialogVisible,
	handleCloseSaveExit,
	isExitDialogOpen,
},) => {
	const [step, setStep,] = React.useState<1 | 2 | 3>(1,)

	const {
		mutateAsync: createGroup,
		isPending,
	} = useCreateGroup()

	return (
		<Form<IGroupFormValues>
			onSubmit={async(values, form,) => {
				const groupName = (values.groupName ?? '').trim()
				const courseName = (values.courseName ?? '').trim()
				const comment = (values.comment ?? '').trim()
				if (!values.startDate) {
					return
				}

				const startDate = values.startDate.toISOString()

				try {
					await createGroup({
						groupName,
						courseName,
						startDate,
						comment: comment || undefined,
					},)

					form.reset()
					setStep(1,)
					handleCloseSaveExit()
					onClose()
					toggleSuccessDialogVisible()
				// eslint-disable-next-line no-empty
				} catch {}
			}}
			validate={validateGroupForm}
			initialValues={INITIAL_VALUES}
			render={({
				handleSubmit,
				submitting,
				errors,
				values,
				hasValidationErrors,
				form,
			},) => {
				const groupName = (values.groupName ?? '').trim()
				const courseName = (values.courseName ?? '').trim()
				const comment = (values.comment ?? '').trim()

				const hasStartDate = values.startDate instanceof Date &&
					!isNaN(values.startDate.getTime(),)

				const isFormEmpty = !groupName &&
					!courseName &&
					!hasStartDate &&
					!comment

				const firstStepDisabled = Boolean(
					errors?.['groupName'],
				) || !groupName

				const secondStepDisabled = Boolean(
					errors?.['courseName'],
				) || !courseName

				const submitDisabled = Boolean(hasValidationErrors,) || submitting || isPending

				return (
					<form className={styles.formContainer} onSubmit={handleSubmit}>
						<h3 className={styles.formHeader}>Add group</h3>

						<LabeledProgressBar
							currentStep={step}
							steps={getGroupFormSteps(values,)}
						/>

						<div className={styles.addFormWrapper}>
							<div className={step !== 1 ?
								'hidden-el' :
								''}>
								<div className={styles.addInputBlock}>
									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>Group name</p>
										<FormField
											name='groupName'
											placeholder='Enter group name'
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

							<div className={step !== 2 ?
								'hidden-el' :
								''}>
								<div className={styles.addInputBlock}>
									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>Course name</p>
										<FormField
											name='courseName'
											placeholder='Enter course name'
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

							<div className={step !== 3 ?
								'hidden-el' :
								''}>
								<div className={styles.addInputBlock}>
									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>Start date</p>
										<CustomDatePickerField
											name='startDate'
											validate={validateDate}
											disableFuture={false}
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
											setStep(2,)
										}}
									/>
									<Button<ButtonType.TEXT>
										type='submit'
										disabled={submitDisabled}
										additionalProps={{
											btnType: ButtonType.TEXT,
											text:    isPending ?
												'Creating...' :
												'Add group',
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
							<ExitGroupUnsavedDialog
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