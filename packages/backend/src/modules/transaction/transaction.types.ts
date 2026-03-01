import type {
	Account,
	Bank,
	Client,
	Document,
	Entity,
	ExpenseCategory,
	Order,
	Portfolio,
	Transaction,
	TransactionDraft,
	TransactionType,
	TransactionTypeVersion,
} from '@prisma/client'
import type { PaginationResult, } from '../../shared/types'
import type { TransactionChartData, } from '../analytics/analytics.types'

export type TransactionExtended = Transaction & {
	account: Account | null
	bank: Bank | null
	client: Client | null
	documents: Array<Document>
	order: Order | null
	portfolio: Portfolio | null
	transactionType: TransactionType | null
	typeVersion: TransactionTypeVersion | null
	usdValue?: number
	expenseCategory?: ExpenseCategory | null
}

export type TransactionAnalytics = {
	id: number
	transactionDate?: Date
	portfolioName?: string
	bankName?: string
	accountName?: string
	entityName?: string
	transactionType?: TransactionType | null
	typeVersion?: TransactionTypeVersion | null
	currency?: string
	amount?: number,
	usdValue?: number
	isin?: string
	security?: string
	serviceProvider?: string
	comment?: string
}

export type TransactionPl = {
	total: number
	totalUsdValue: number
	totalCurrencyValue: number
	isins: Array<string>
	securities: Array<string>
	chartData: Array<TransactionChartData>
	oldestDate: string | null
}

export type TransactionAnalyticsRes = PaginationResult<TransactionAnalytics>

export type TransactionListRes = PaginationResult<TransactionExtended>

export type TransactionDraftExtended = TransactionDraft & {
	account: Account | null
	bank: Bank | null
	client: Client | null
	documents: Array<Document>
	order: Order | null
	portfolio: Portfolio | null
	entity: Entity | null
	transactionType: TransactionType | null
	typeVersion: TransactionTypeVersion | null
	usdValue?: number
}
export enum SortFields {
	ID = 'id',
	AMOUNT = 'amount',
	TRANSACTION_DATE = 'transactionDate',
	ISIN = 'isin',
	SECURITY = 'security',
}

export type TransactionSortKey = keyof typeof SortFields

export type TDeleteRefactoredTransactionPayload = {
	userInfo: {
		name: string
		email: string | null
		reason: string
	}
}