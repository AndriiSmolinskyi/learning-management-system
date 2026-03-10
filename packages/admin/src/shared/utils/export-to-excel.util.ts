/* eslint-disable max-depth */
/* eslint-disable complexity */
import * as XLSX from 'xlsx'

import type {
	TExcelSheetType,
} from '../types'

type Props = {
	sheetData: TExcelSheetType | undefined
	fileName: string;
}

export const exportToExcel = ({
	sheetData,
	fileName,
}: Props,): void => {
	if (sheetData) {
		const ws = XLSX.utils.aoa_to_sheet(sheetData,)

		const range = XLSX.utils.decode_range(ws['!ref']!,)

		for (let row = range.s.r + 1; row <= range.e.r; row++) {
			for (let col = range.s.c; col <= range.e.c; col++) {
				const cellRef = XLSX.utils.encode_cell({
					r: row, c: col,
				},)
				const cell = ws[cellRef]
				if (!cell) {
					continue
				}
				const value = cell.v

				// todo: Remove if not needed the second option
				// if (typeof value === 'string' && (/^\d{4}-\d{2}-\d{2}/).test(value,)) {
				// 	const d = new Date(value,)
				// 	if (!isNaN(d.getTime(),)) {
				// 		cell.t = 'd'
				// 		cell.v = d
				// 		cell.z = 'dd-mm-yyyy'
				// 		continue
				// 	}
				// }
				if (typeof value === 'string' && (/^\d{4}-\d{2}-\d{2}/).test(value,)) {
					const d = new Date(value,)
					if (!isNaN(d.getTime(),)) {
						const excelDate = (d.getTime() - new Date(Date.UTC(1899, 11, 30,),).getTime()) / 86400000
						cell.t = 'n'
						cell.v = excelDate
						cell.z = 'dd.mm.yyyy'
						continue
					}
				}
				if (typeof value === 'number') {
					cell.t = 'n'
					cell.z = '#,##0.00'
					continue
				}
			}
		}
		const colWidths = []
		for (let col = range.s.c; col <= range.e.c; col++) {
			let maxLength = 10
			for (let row = range.s.r; row <= range.e.r; row++) {
				const cellRef = XLSX.utils.encode_cell({
					r: row, c: col,
				},)
				const cell = ws[cellRef]
				if (!cell) {
					continue
				}

				let cellValue = cell.v

				if (cellValue === null || cellValue === undefined) {
					continue
				}
				cellValue = String(cellValue,)
				maxLength = Math.max(maxLength, cellValue.length,)
			}
			colWidths.push({
				wch: maxLength + 2,
			},)
		}

		ws['!cols'] = colWidths
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, 'Sheet1',)
		XLSX.writeFile(wb, `${fileName}.xlsx`,)
	}
}