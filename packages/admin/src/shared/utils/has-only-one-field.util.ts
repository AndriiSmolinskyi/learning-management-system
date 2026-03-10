export const hasOnlyOneField = <T extends Record<string, unknown>>(props: T,): boolean => {
	const values = Object.values(props,)

	const filledFieldsCount = values.filter((value,) => {
		return value !== undefined && value !== null && value !== ''
	},).length

	return filledFieldsCount === 1
}