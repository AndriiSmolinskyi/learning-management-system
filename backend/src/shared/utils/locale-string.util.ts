/* eslint-disable complexity */
export const localeString = (value: number,
	currency = '',
	minimumFractionDigits = 0,
	showDecimals = true,): string => {
	if (typeof value === 'number') {
		const formatter = currency ?
			new Intl.NumberFormat('En', {
				currency,
				style:                  'currency',
				minimumFractionDigits: showDecimals ?
					minimumFractionDigits :
					0,
				maximumFractionDigits: showDecimals ?
					2 :
					0,
			},) :
			new Intl.NumberFormat('En', {
				minimumFractionDigits: showDecimals ?
					minimumFractionDigits :
					0,
				maximumFractionDigits: showDecimals ?
					2 :
					0,
			},)
		return formatter.format(value,)
	}
	return value
}