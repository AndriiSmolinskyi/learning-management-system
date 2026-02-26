export const formatDateDDMMYYYY = (dateInput?: string | Date,):string => {
	if (!dateInput) {
		return ''
	}
	const date = dateInput instanceof Date ?
		dateInput :
		new Date(dateInput,)
	const day = String(date.getDate(),).padStart(2, '0',)
	const month = String(date.getMonth() + 1,).padStart(2, '0',)
	const year = date.getFullYear()
	return `${day}/${month}/${year}`
}