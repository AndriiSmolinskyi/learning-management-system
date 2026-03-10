import type {
	IOptionType,
} from '../../../shared/types'

export type StepType = 1 | 2 | 3

export enum CashFlow {
  INFLOW = 'Inflow',
  OUTFLOW = 'Outflow',
}

export enum PlType {
	P = 'P',
	L = 'L',
	N = ''
}

export type TransactionFormValues = {
	name?: string
	categoryType?: IOptionType
	cashFlow?: string
	pl?: string
	comment?: string | null | undefined
	annualAssets?: Array<string | undefined> | null
	isNewVersion?: string | null
}
