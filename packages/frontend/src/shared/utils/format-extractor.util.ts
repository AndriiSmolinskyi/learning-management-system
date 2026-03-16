export const getFileFormat = (fileName: string,): string | null => {
	const parts = fileName.split('.',)
	if (parts.length > 1) {
		return parts.pop() ?? null
	}
	return null
}