import {
	ReportCategory,
} from '../../../shared/types'

export const generateReportName = (category: ReportCategory | undefined,): string => {
	switch (category) {
	case ReportCategory.BOND:
		return 'Bond report'
	case ReportCategory.STOCK:
		return 'Stock report'
	case ReportCategory.STATEMENT:
		return 'Statement'
	case ReportCategory.CUSTOM:
		return 'Custom report'
	default:
		return ''
	}
}