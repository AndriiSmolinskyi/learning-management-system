export interface IStudentFormValues {
	firstName: string
	lastName: string
	email: string
	phoneNumber?: string | null
	country?: string | null
	city?: string | null
	comment?: string | null
}

export type StepType = 1 | 2 | 3 | 4
