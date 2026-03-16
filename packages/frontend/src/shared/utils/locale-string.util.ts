/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
export const localeString = (
	value: number,
	currency = '',
	minimumFractionDigits = 0,
	showDecimals = true,
): string => {
	if (typeof value === 'number') {
		const baseMaxDigits = 2
		const maxFractionDigits = showDecimals ?
			Math.max(minimumFractionDigits, baseMaxDigits,) :
			0
		const factor = showDecimals ?
			(10 ** maxFractionDigits) :
			1
		const rounded = showDecimals ?
			value :
			(value >= 0 && value < 1) ?
				Math.floor(value * factor,) / factor :
				(value <= 0 && value > -1) ?
					Math.ceil(value * factor,) / factor :
					Math.round(value,)
		const isNegative = value < 0 && rounded !== 0
		const absoluteValue = Math.abs(rounded,)

		const formatter = currency ?
			new Intl.NumberFormat('en', {
				style:                 'currency',
				currency,
				minimumFractionDigits: showDecimals ?
					minimumFractionDigits :
					0,
				maximumFractionDigits: showDecimals ?
					maxFractionDigits :
					0,
			},) :
			new Intl.NumberFormat('en', {
				minimumFractionDigits: showDecimals ?
					minimumFractionDigits :
					0,
				maximumFractionDigits: showDecimals ?
					maxFractionDigits :
					0,
			},)
		const formatted = formatter.format(absoluteValue,)
		return isNegative ?
			`-${formatted}` :
			formatted
	}

	return String(value,)
}

// todo: clear if new version good
// export const formatWithAllDecimals = (value: number,): string => {
// 	if (typeof value !== 'number' || Number.isNaN(value,)) {
// 		return String(value,)
// 	}
// 	const [intPart, decimalPart,] = value.toString().split('.',)
// 	const formattedInt = new Intl.NumberFormat('en-US',).format(Number(intPart,),)
// 	if (!decimalPart) {
// 		return formattedInt
// 	}
// 	return `${formattedInt}.${decimalPart}`
// }

export const formatWithAllDecimals = (value: number,): string => {
	if (typeof value !== 'number' || Number.isNaN(value,)) {
		return String(value,)
	}

	const [intPart, decimalPart,] = value.toString().split('.',)
	const formattedInt = Number(intPart,).toLocaleString('en-US',)

	return decimalPart ?
		`${formattedInt}.${decimalPart}` :
		formattedInt
}
