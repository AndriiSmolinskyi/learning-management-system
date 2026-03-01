import type {
	Bank,
	Client,
	Entity,
	Portfolio,
	PortfolioDraft,
	BankList,
} from '@prisma/client'

export type TBankExtended = Bank & {
	client?: Client | null
	portfolio?: Portfolio | null
	portfolioDraft?: PortfolioDraft | null
	entity?: Entity | null
	bankList?: BankList | null
}