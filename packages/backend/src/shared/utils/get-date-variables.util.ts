
/**
 * Utility function to get commonly used date values.
 *
 * @returns An object with:
 * - `today`: current date in ISO format (YYYY-MM-DD)
 * - `monthAgo`: the date exactly one month ago
 * - `yesterday`: the date one day ago
 */
export const getDateInfo = (): {
	today: string
	monthAgo: string
	yesterday: string
	weekAgo: string
} => {
	const today = new Date()
	const monthAgo = new Date()
	const weekAgo = new Date()
	const yesterday = new Date()

	monthAgo.setMonth(monthAgo.getMonth() - 1,)
	weekAgo.setDate(weekAgo.getDate() - 7,)
	yesterday.setDate(yesterday.getDate() - 1,)

	const [todayStr,] = today.toISOString().split('T',)
	const [monthAgoStr,] = monthAgo.toISOString().split('T',)
	const [weekAgoStr,] = weekAgo.toISOString().split('T',)
	const [prevDay,] = yesterday.toISOString().split('T',)

	return {
		today:     todayStr,
		monthAgo:  monthAgoStr,
		yesterday: prevDay,
		weekAgo:   weekAgoStr,
	}
}