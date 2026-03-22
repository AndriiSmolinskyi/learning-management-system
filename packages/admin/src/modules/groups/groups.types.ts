export interface IGroupFormValues {
	groupName: string
	courseName: string
	startDate?: Date | null
	comment?: string | null
}

export type StepType = 1 | 2 | 3

export type TEditableGroup = {
	id: string
	groupName: string
	courseName: string
	startDate: string
	comment?: string | null
	createdAt: string
	updatedAt: string
}