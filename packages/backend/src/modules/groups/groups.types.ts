export type GroupItem = {
	id: string
	groupName: string
	courseName: string
	comment?: string | null
	startDate: string
	createdAt: string
	updatedAt: string
}

export type GroupsListReturn = {
	items: Array<GroupItem>
	total: number
	page: number
	pageSize: number
}