// eslint-disable-next-line complexity
export const getAvatar = (name: string | null,): string => {
	if (!name) {
		return ''
	}
	const words = name.trim().split(/\s+/,)

	if (words.length >= 2) {
		const firstLetter = words[0]?.[0] ?? ''
		const secondLetter = words[1]?.[0] ?? ''
		return firstLetter + secondLetter
	} else if (words.length === 1) {
		return words[0]?.[0] ?? ''
	}
	return ''
}