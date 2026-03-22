/* eslint-disable @typescript-eslint/no-unnecessary-condition */
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
	CustomDatePickerField,
} from '../../../shared/components'
import {
	Refresh,
} from '../../../assets/icons'
import {
	useUpdateGroup,
} from '../../../shared/hooks/groups/groups.hook'
import {
	isDeepEqual,
} from '../../../shared/utils'
import {
	validateGroupForm,
} from '../utils/add-group.validator'
import {
	validateDate,
} from '../../../shared/utils/validators'
import type {
	IGroupFormValues,
	TEditableGroup,
} from '../groups.types'
import * as styles from './edit-groups.style'

type Props = {
	onClose: () => void
	group: TEditableGroup | undefined
}

const INITIAL_VALUES: IGroupFormValues = {
	groupName:  '',
	courseName: '',
	startDate:  null,
	comment:    '',
}

const getBasicInfo = (values: IGroupFormValues,): string => {
	const parts = [
		(values.groupName ?? '').trim(),
		(values.courseName ?? '').trim(),
	].filter(Boolean,)

	return parts.length ?
		parts.join(' / ',) :
		'—'
}

const getAdditionalInfo = (values: IGroupFormValues,): string => {
	const startDate = values.startDate instanceof Date ?
		values.startDate.toLocaleDateString('en-GB',).replace(/\//g, '.',) :
		undefined

	const parts = [
		startDate,
		(values.comment ?? '').trim(),
	].filter(Boolean,)

	return parts.length ?
		parts.join(', ',) :
		'—'
}

export const EditGroup: React.FC<Props> = ({
	onClose,
	group,
},) => {
	const {
		mutateAsync: updateGroup,
		isPending: isUpdating,
	} = useUpdateGroup()

	const [firstStepOpen, setFirstStepOpen,] = React.useState(false,)
	const [secondStepOpen, setSecondStepOpen,] = React.useState(false,)

	const [groupForm, setGroupForm,] = React.useState<IGroupFormValues>(INITIAL_VALUES,)

	const baselineInitial = React.useMemo<IGroupFormValues>(() => {
		if (!group) {
			return INITIAL_VALUES
		}

		return {
			groupName:  group.groupName || '',
			courseName: group.courseName || '',
			startDate:  group.startDate ?
				new Date(group.startDate,) :
				null,
			comment:    group.comment ?? '',
		}
	}, [group,],)

	React.useEffect(() => {
		if (!group) {
			return
		}

		setGroupForm(baselineInitial,)
	}, [group, baselineInitial,],)

	const handleSubmit = async(): Promise<void> => {
		if (!group?.id) {
			return
		}

		await updateGroup({
			id:   group.id,
			body: {
				groupName:  (groupForm.groupName ?? '').trim(),
				courseName: (groupForm.courseName ?? '').trim(),
				startDate:  groupForm.startDate ?
					groupForm.startDate.toISOString() :
					undefined,
				comment:    (groupForm.comment ?? '').trim() || undefined,
			},
		},)

		onClose()
	}

	const formChanged = !isDeepEqual<IGroupFormValues>(groupForm, baselineInitial,)
	const isPending = isUpdating

	return (
		<Form<IGroupFormValues>
			onSubmit={handleSubmit}
			validate={validateGroupForm}
			initialValues={groupForm}
			render={({
				handleSubmit,
				form,
			},) => {
				return (
					<form className={styles.formContainer} onSubmit={handleSubmit}>
						<h3 className={styles.formHeader}>Edit group</h3>

						<div className={styles.fieldsContainer(firstStepOpen || secondStepOpen,)}>
							<div className={styles.editFormWrapper}>
								<FormCollapse
									title='Basic information'
									info={[getBasicInfo(groupForm,),]}
									isOpen={firstStepOpen}
									onClose={setFirstStepOpen}
								>
									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Group name</p>
										<FormField
											name='groupName'
											placeholder='Enter group name'
											onChange={(e,) => {
												const {
													value,
												} = e.target
												setGroupForm((prev,) => {
													return {
														...prev,
														groupName: value,
													}
												},)
											}}
											value={groupForm.groupName}
										/>
									</div>

									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Course name</p>
										<FormField
											name='courseName'
											placeholder='Enter course name'
											onChange={(e,) => {
												const {
													value,
												} = e.target
												setGroupForm((prev,) => {
													return {
														...prev,
														courseName: value,
													}
												},)
											}}
											value={groupForm.courseName}
										/>
									</div>
								</FormCollapse>

								<FormCollapse
									title='Additional information'
									info={[getAdditionalInfo(groupForm,),]}
									isOpen={secondStepOpen}
									onClose={setSecondStepOpen}
								>
									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Start date</p>
										<CustomDatePickerField
											name='startDate'
											value={groupForm.startDate}
											onChange={(value,) => {
												setGroupForm((prev,) => {
													return {
														...prev,
														startDate: value,
													}
												},)
											}}
											validate={validateDate}
											disableFuture={false}
										/>
									</div>

									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Comment</p>
										<FormField
											name='comment'
											placeholder='Enter comment'
											onChange={(e,) => {
												const {
													value,
												} = e.target
												setGroupForm((prev,) => {
													return {
														...prev,
														comment: value,
													}
												},)
											}}
											value={groupForm.comment ?? ''}
										/>
									</div>
								</FormCollapse>

								<div className={styles.editBtnWrapper}>
									<Button<ButtonType.TEXT>
										onClick={() => {
											setGroupForm(baselineInitial,)
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