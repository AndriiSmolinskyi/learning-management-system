/* eslint-disable no-mixed-operators */
/* eslint-disable no-await-in-loop */

import {
	jsPDF as JSPDF,
} from 'jspdf'
import {
	addFontMedium,
} from './downoload-medium.font'
import {
	toPng,
} from 'html-to-image'

class PDFCustomService {
	constructor() {
		addFontMedium()
	}

	public async getCustomPDF(htmlElement: HTMLElement, fileName: string = 'document.pdf',): Promise<void> {
		const doc = new JSPDF('l', 'pt', 'a4',)
		let currentYPosition = 10
		const padding = 10
		const pageWidth = doc.internal.pageSize.width
		const elements = Array.from(htmlElement.querySelectorAll('.pdf-element',),)

		for (const el of elements) {
			const element = el as HTMLElement
			let dataUrl: string
			try {
				dataUrl = await toPng(element, {
					quality: 0.0, pixelRatio: 1.5,
				},)
			} catch (error) {
				continue
			}

			const imgWidth = pageWidth - 20 * padding
			const imgHeight = (element.scrollHeight * imgWidth) / element.scrollWidth
			const xPosition = (pageWidth - imgWidth) / 2

			if (currentYPosition + imgHeight > doc.internal.pageSize.height) {
				doc.addPage()
				currentYPosition = 10
			}

			doc.addImage(dataUrl, 'PNG', xPosition, currentYPosition, imgWidth, imgHeight,)
			currentYPosition = currentYPosition + (imgHeight + padding)
		}

		doc.save(fileName,)
	}
}

export const pdfCustomService = new PDFCustomService()
