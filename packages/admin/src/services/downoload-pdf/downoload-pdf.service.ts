import {
	jsPDF as JSPDF,
} from 'jspdf'
import {
	addFontMedium,
} from './downoload-medium.font'

const html2canvasScale = 1

class PDFService {
	constructor() {
		addFontMedium()
	}

	public getPDF(htmlElement: HTMLElement, fileName: string = 'document.pdf',): void {
		const doc = new JSPDF('p', 'pt', 'a4',)
		doc.setFont('Montserrat', 'normal',)

		doc.html(htmlElement, {
			callback(pdf,) {
				pdf.save(fileName,)
			},
			html2canvas: {
				scale: html2canvasScale,
			},
		},)
	}
}

export const pdfService = new PDFService()
