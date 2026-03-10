export type TGetTablePreferenceProps = {
	userName: string
	tableName: string
}

export type TUpsertTablePreferenceProps = {
	userName: string
	tableName: string
	payload: string
}

export type IUserTablePreference = {
	id: string
	userName: string
	tableName: string
	payload: string
	createdAt: string
	updatedAt: string
}