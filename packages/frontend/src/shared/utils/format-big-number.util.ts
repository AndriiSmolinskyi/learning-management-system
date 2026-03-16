/* eslint-disable complexity */
export const formatBigNumber = (value: number,): string => {
	if (isNaN(value,)) {
		return '0'
	}

	const absValue = Math.abs(value,)
	if (absValue >= 1_000_000_000) {
		const result = (value / 1_000_000_000).toFixed(1,)
		return result.endsWith('.0',) ?
			`${result.replace('.0', '',)}B` :
			`${result}B`
	} else if (absValue >= 1_000_000) {
		const result = (value / 1_000_000).toFixed(1,)
		return result.endsWith('.0',) ?
			`${result.replace('.0', '',)}M` :
			`${result}M`
	} else if (absValue >= 1_000) {
		const result = (value / 1_000).toFixed(1,)
		if (absValue >= 100_000 && absValue < 1_000_000) {
			return `${Math.round(value / 1_000,)}K`
		}
		return result.endsWith('.0',) ?
			`${result.replace('.0', '',)}K` :
			`${result}K`
	}

	return value.toLocaleString('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	},)
}