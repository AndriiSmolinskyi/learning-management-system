export const handleDownload = async(storageName: string,): Promise<void> => {
	const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/document/download`, {
		method:  'POST',
		body:    JSON.stringify({
			storageName,
		},),
		headers: {
			'Content-Type':  'application/json',
		},
		credentials: 'include',
	},)
	const blob = await response.blob()
	const contentDisposition = response.headers.get('Content-Disposition',)
	const filename = contentDisposition ?
		contentDisposition.split('filename=',)[1]?.replace(/"/g, '',) ?? 'download' :
		'download'
	const url = URL.createObjectURL(blob,)
	const a = document.createElement('a',)
	a.href = url
	a.download = filename
	document.body.appendChild(a,)
	a.click()
	URL.revokeObjectURL(url,)
	document.body.removeChild(a,)
}