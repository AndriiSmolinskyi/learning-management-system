/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../shared/types'
import type {
	TransactionFormValues,
} from './transaction.types'
import {
	TransactionCashFlow,
} from '../../../shared/types'
import type {
	TExcelSheetType, ITransactionType,
} from '../../../shared/types'

const getTransactionBasic = (values: TransactionFormValues,): string => {
	const name = values.name?.trim()
	const category = values.categoryType?.label.trim()

	if (!name || !category) {
		return 'Enter a transaction name and select a category to proceed.'
	}

	return `${name}, ${category}`
}

const getTransactionFinancial = (values: TransactionFormValues,): string => {
	const cashFlow = values.cashFlow?.trim()
	const plType = values.pl?.trim()

	if (!cashFlow || !plType) {
		return 'Set the cashflow direction and profit/loss information.'
	}

	return `${cashFlow}, ${plType}`
}

const getTransactionReporting = (): string => {
	return `Select reporting details and leave a comment if needed.`
}

export const getTransactionTypeFormSteps = (values: TransactionFormValues,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Basic information',
			labelDesc:  getTransactionBasic(values,),
		},
		{
			labelTitle: 'Financial details',
			labelDesc:  getTransactionFinancial(values,),
		},
		{
			labelTitle: 'Reporting',
			labelDesc:  getTransactionReporting(),
		},
	]
}
// todo: clear if good
// export const getTransactionTypeSheetData = (tableData: Array<ITransactionType>,): TExcelSheetType => {
// 	return [[
// 		'Name',
// 		'Category',
// 		'Cash flow',
// 		'P/L type',
// 		'Related Transaction',
// 		'Related asset',
// 	], ...tableData.map(({
// 		name,
// 		categoryType,
// 		cashFlow,
// 		pl,
// 		relatedType,
// 		asset,
// 	},) => {
// 		const renderCashFlow = (cf?: string,): string => {
// 			if (cf === TransactionCashFlow.INFLOW) {
// 				return 'Cash In'
// 			}
// 			if (cf === TransactionCashFlow.OUTFLOW) {
// 				return 'Cash Out'
// 			}
// 			return 'N/A'
// 		}

// 		const renderPl = (pl?: string | null,): string => {
// 			if (pl === 'P') {
// 				return 'Profit'
// 			}
// 			if (pl === 'L') {
// 				return 'Loss'
// 			}
// 			return 'Neutral'
// 		}
// 		return [
// 			name ?? '',
// 			categoryType?.name ?? '',
// 			renderCashFlow(cashFlow,),
// 			renderPl(pl,),
// 			relatedType?.name ?? 'N/A',
// 			asset ?? 'N/A',
// 		]
// 	},),]
// }
export const getTransactionTypeSheetData = (tableData: Array<ITransactionType>,): TExcelSheetType => {
	return [[
		'Name',
		'Category',
		'Cash flow',
		'P/L type',
		'Related Transaction',
		'Related asset',
		'Comment',
	],
	...tableData.map(({
		versions, relatedType, asset,
	},) => {
		const [v0,] = versions
		const [rv0,] = relatedType?.versions ?? []
		const renderCashFlow = (cf?: string,): string => {
			if (cf === TransactionCashFlow.INFLOW) {
				return 'Cash In'
			}
			if (cf === TransactionCashFlow.OUTFLOW) {
				return 'Cash Out'
			}
			return 'N/A'
		}

		const renderPl = (pl?: string | null,): string => {
			if (pl === 'P') {
				return 'Profit'
			}
			if (pl === 'L') {
				return 'Loss'
			}
			return 'Neutral'
		}

		return [
			v0?.name ?? '',
			v0?.categoryType?.name ?? '',
			renderCashFlow(v0?.cashFlow,),
			renderPl(v0?.pl,),
			rv0?.name ?? rv0?.name ?? 'N/A',
			asset ?? 'N/A',
			v0?.comment ?? 'N/A',
		]
	},),]
}
