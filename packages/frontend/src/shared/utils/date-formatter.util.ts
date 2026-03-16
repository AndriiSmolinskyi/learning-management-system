import {
	format, min,
} from 'date-fns'
import type {
	ITransaction,
} from '../types'

export function formatDateToDDMMYYYY(isoString: Date | string, dotted?: boolean,): string {
	const date = new Date(isoString,)

	const day = date.getDate().toString()
		.padStart(2, '0',)
	const month = (date.getMonth() + 1).toString().padStart(2, '0',)
	const year = date.getFullYear()

	return dotted ?
		`${day}.${month}.${year}` :
		`${day}/${month}/${year}`
}

export const formatDateForDraft = (isoDate: string,):string => {
	const date = new Date(isoDate,)
	const months = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
	]
	const day = date.getDate()
	const month = months[date.getMonth()]
	const year = date.getFullYear()
	return `${month} ${day}, ${year}`
}

export const formatToUTCISOString = (date: Date, isHMS?: boolean,): string => {
	const newDate = new Date()
	return new Date(Date.UTC(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		isHMS ?
			newDate.getHours() :
			0,
		isHMS ?
			newDate.getMinutes() :
			0,
		isHMS ?
			newDate.getSeconds() :
			0,
		0,
	),).toISOString()
}

export const formatDateToThreeLetterMonth = (isoDate: string,): string => {
	return new Date(isoDate,).toLocaleDateString('en-GB', {
		month: 'short',
		day:   'numeric',
		year:  'numeric',
	},)
		.replace(/(\d+) (\w+) (\d+)/, '$2 $1, $3',)
}

export const getOldestTransactionDate = (transactions: Array<ITransaction>,): string | null => {
	if (!transactions.length) {
		return null
	}
	const dates = transactions
		.map((t,) => {
			return (t.transactionDate ?
				new Date(t.transactionDate,) :
				null)
		},)
		.filter((d,): d is Date => {
			return d !== null
		},)
	if (!dates.length) {
		return null
	}
	const oldestDate = min(dates,)
	return format(oldestDate, 'dd.MM.yyyy',)
}

export const isDateFromPast = (dateString: string,): boolean => {
	const date = new Date(dateString,)
	const today = new Date()
	today.setHours(0, 0, 0, 0,)
	const input = new Date(date,)
	input.setHours(0, 0, 0, 0,)
	return input < today
}