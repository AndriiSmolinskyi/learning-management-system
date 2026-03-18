export type StudentItem = {
	id: string
	email: string

	firstName: string
	lastName: string

	phoneNumber?: string | null
	country?: string | null
	city?: string | null

	createdAt: string
	updatedAt: string
}

export type StudentsListReturn = {
	items: Array<StudentItem>
	total: number
	page: number
	pageSize: number
}

export type CreateStudentReturn = {
	student: StudentItem
	temporaryPassword: string
}