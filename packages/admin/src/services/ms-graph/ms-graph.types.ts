export type MsUser = {
	displayName: string | null,
	mail: string | null,
	id: string
	roles: Array<string>
}

export type TGroupsRes = {
	value?: Array<{id: string}>
}