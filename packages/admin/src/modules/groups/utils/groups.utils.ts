/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type {
	IGroupFormValues,
} from '../groups.types'
import type {
	IProgressBarStep,
} from '../../../shared/types'

const getGroupNameStep = (values: IGroupFormValues,): string => {
	const groupName = (values.groupName ?? '').trim()

	if (!groupName) {
		return 'Enter group name.'
	}

	return groupName
}

const getCourseNameStep = (values: IGroupFormValues,): string => {
	const courseName = (values.courseName ?? '').trim()

	if (!courseName) {
		return 'Enter course name.'
	}

	return courseName
}

const getAdditionalStep = (values: IGroupFormValues,): string => {
	const startDate = values.startDate instanceof Date ?
		values.startDate.toLocaleDateString('en-GB',).replace(/\//g, '.',) :
		undefined

	const comment = (values.comment ?? '').trim()

	const items = [
		startDate,
		comment,
	].filter(Boolean,)

	if (items.length === 0) {
		return 'Add start date and comment.'
	}

	return items.join(', ',)
}

export const getGroupFormSteps = (
	values: IGroupFormValues,
): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Group',
			labelDesc:  getGroupNameStep(values,),
		},
		{
			labelTitle: 'Course',
			labelDesc:  getCourseNameStep(values,),
		},
		{
			labelTitle: 'Additional info',
			labelDesc:  getAdditionalStep(values,),
		},
	]
}