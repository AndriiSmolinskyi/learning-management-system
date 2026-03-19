/* eslint-disable max-lines */
/* eslint-disable complexity */
import React from 'react'
import {
	Form,
} from 'react-final-form'

import {
	Button,
	ButtonType,
	Color,
	FormCollapse,
	FormField,
	Size,
	PhoneField,
} from '../../../shared/components'
import {
	Refresh,
} from '../../../assets/icons'
import {
	useStudent,
	useUpdateStudent,
} from '../../../shared/hooks/students/students.hooks'
import {
	isDeepEqual,
} from '../../../shared/utils'
import {
	validateStudentForm,
} from '../utils/add-student.validator'
import type {
	IStudentFormValues,
} from '../students.types'
import * as styles from './edit-students.style'

type Props = {
	onClose: () => void
	studentId: string | undefined
}

const INITIAL_VALUES: IStudentFormValues = {
	firstName:   '',
	lastName:    '',
	email:       '',
	phoneNumber: '',
	country:     '',
	city:        '',
	comment:     '',
}

const getBasicInfo = (values: IStudentFormValues,): string => {
	const fullName = `${values.firstName.trim() || ''} ${values.lastName.trim() || ''}`.trim()

	return fullName || '—'
}

const getContactInfo = (values: IStudentFormValues,): string => {
	const parts = [
		values.email.trim(),
		values.phoneNumber?.trim(),
	].filter(Boolean,)

	return parts.length ?
		parts.join(', ',) :
		'—'
}

const getAdditionalInfo = (values: IStudentFormValues,): string => {
	const parts = [
		values.country?.trim(),
		values.city?.trim(),
	].filter(Boolean,)

	return parts.length ?
		parts.join(', ',) :
		'—'
}

export const EditStudent: React.FC<Props> = ({
	onClose,
	studentId,
},) => {
	const {
		data: studentInitial,
		isFetching: isStudentInitialFetching,
	} = useStudent(studentId,)

	const {
		mutateAsync: updateStudent,
		isPending: isUpdating,
	} = useUpdateStudent()

	const [firstStepOpen, setFirstStepOpen,] = React.useState(false,)
	const [secondStepOpen, setSecondStepOpen,] = React.useState(false,)
	const [thirdStepOpen, setThirdStepOpen,] = React.useState(false,)

	const [studentForm, setStudentForm,] = React.useState<IStudentFormValues>(INITIAL_VALUES,)

	const baselineInitial = React.useMemo<IStudentFormValues>(() => {
		if (!studentInitial) {
			return INITIAL_VALUES
		}

		return {
			firstName:   studentInitial.firstName || '',
			lastName:    studentInitial.lastName || '',
			email:       studentInitial.email || '',
			phoneNumber: studentInitial.phoneNumber ?? '',
			country:     studentInitial.country ?? '',
			city:        studentInitial.city ?? '',
			comment:     studentInitial.comment ?? '',
		}
	}, [studentInitial,],)

	React.useEffect(() => {
		if (!studentInitial) {
			return
		}

		setStudentForm(baselineInitial,)
	}, [studentInitial, baselineInitial,],)

	const handleSubmit = async(): Promise<void> => {
		if (!studentId) {
			return
		}

		await updateStudent({
			id:   studentId,
			body: {
				firstName:   studentForm.firstName.trim(),
				lastName:    studentForm.lastName.trim(),
				email:       studentForm.email.trim(),
				phoneNumber: studentForm.phoneNumber?.trim() ?? undefined,
				country:     studentForm.country?.trim() ?? undefined,
				city:        studentForm.city?.trim() ?? undefined,
				comment:     studentForm.comment?.trim() ?? undefined,
			},
		},)

		onClose()
	}

	const formChanged = !isDeepEqual<IStudentFormValues>(studentForm, baselineInitial,)
	const isPending = isStudentInitialFetching || isUpdating

	return (
		<Form<IStudentFormValues>
			onSubmit={handleSubmit}
			validate={validateStudentForm}
			initialValues={studentForm}
			render={({
				handleSubmit,
				form,
			},) => {
				return (
					<form className={styles.formContainer} onSubmit={handleSubmit}>
						<h3 className={styles.formHeader}>Edit student</h3>

						<div className={styles.fieldsContainer(firstStepOpen || secondStepOpen || thirdStepOpen,)}>
							<div className={styles.editFormWrapper}>
								<FormCollapse
									title='Basic information'
									info={[getBasicInfo(studentForm,),]}
									isOpen={firstStepOpen}
									onClose={setFirstStepOpen}
								>
									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>First name</p>
										<FormField
											name='firstName'
											placeholder='Enter first name'
											onChange={(e,) => {
												const {
													value,
												} = e.target
												setStudentForm((prev,) => {
													return {
														...prev,
														firstName: value,
													}
												},)
											}}
											value={studentForm.firstName}
										/>
									</div>

									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Last name</p>
										<FormField
											name='lastName'
											placeholder='Enter last name'
											onChange={(e,) => {
												const {
													value,
												} = e.target
												setStudentForm((prev,) => {
													return {
														...prev,
														lastName: value,
													}
												},)
											}}
											value={studentForm.lastName}
										/>
									</div>
								</FormCollapse>

								<FormCollapse
									title='Contact information'
									info={[getContactInfo(studentForm,),]}
									isOpen={secondStepOpen}
									onClose={setSecondStepOpen}
								>
									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Email</p>
										<FormField
											name='email'
											placeholder='Enter email'
											onChange={(e,) => {
												const {
													value,
												} = e.target
												setStudentForm((prev,) => {
													return {
														...prev,
														email: value,
													}
												},)
											}}
											value={studentForm.email}
										/>
									</div>

									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Phone number</p>
										<PhoneField
											name='phoneNumber'
											placeholder='Enter phone number'
											onChange={(e,) => {
												const {
													value,
												} = e.target
												setStudentForm((prev,) => {
													return {
														...prev,
														phoneNumber: value,
													}
												},)
											}}
											value={studentForm.phoneNumber ?? ''}
										/>
									</div>
								</FormCollapse>

								<FormCollapse
									title='Additional information'
									info={[getAdditionalInfo(studentForm,),]}
									isOpen={thirdStepOpen}
									onClose={setThirdStepOpen}
								>
									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Country</p>
										<FormField
											name='country'
											placeholder='Enter country'
											onChange={(e,) => {
												const {
													value,
												} = e.target
												setStudentForm((prev,) => {
													return {
														...prev,
														country: value,
													}
												},)
											}}
											value={studentForm.country ?? ''}
										/>
									</div>

									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>City</p>
										<FormField
											name='city'
											placeholder='Enter city'
											onChange={(e,) => {
												const {
													value,
												} = e.target
												setStudentForm((prev,) => {
													return {
														...prev,
														city: value,
													}
												},)
											}}
											value={studentForm.city ?? ''}
										/>
									</div>

									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Comment (optional)</p>
										<FormField
											name='comment'
											placeholder='Enter comment'
											onChange={(e,) => {
												const {
													value,
												} = e.target
												setStudentForm((prev,) => {
													return {
														...prev,
														comment: value,
													}
												},)
											}}
											value={studentForm.comment ?? ''}
										/>
									</div>
								</FormCollapse>

								<div className={styles.editBtnWrapper}>
									<Button<ButtonType.TEXT>
										onClick={() => {
											setStudentForm(baselineInitial,)
											form.reset(baselineInitial,)
										}}
										disabled={!formChanged || isPending}
										additionalProps={{
											btnType:  ButtonType.TEXT,
											text:     'Clear',
											size:     Size.MEDIUM,
											color:    Color.SECONDRAY_GRAY,
											leftIcon: <Refresh width={20} height={20} />,
										}}
									/>

									<Button<ButtonType.TEXT>
										type='submit'
										disabled={Boolean(!formChanged || isPending,)}
										additionalProps={{
											btnType: ButtonType.TEXT,
											text:    'Save edits',
											size:    Size.MEDIUM,
										}}
									/>
								</div>
							</div>
						</div>
					</form>
				)
			}}
		/>
	)
}