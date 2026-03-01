import type { CryptoData, CurrencyData, MetalData, Prisma,} from '@prisma/client'
import type { TAssetExtended, } from '../asset/asset.types'
import type { ITransactionSelected, TBondSelected, TEquitySelected, TEtfSelected, } from '../common/cache-sync/cache-sync.types'

export interface IBudgetListFiltered {
	id:          string,
	clientId:    string,
	name:        string,
	isActivated: boolean | null,
	clientName:  string,
}

export type BudgetPlanWithRelations = Prisma.BudgetPlanGetPayload<{
	include: {
		allocations: true
		client: true
		budgetPlanBankAccounts: {
		include: {
			bank: true
			account: true
		}
		}
	}
  }> & {
	totalBanks: number
	totalManage: number
}

export type BudgetPlanExtened = Prisma.BudgetPlanGetPayload<{
	include: {
		allocations: true
		client: true
		budgetPlanBankAccounts: {
		include: {
			bank: {
				include: {
					assets: true
					bankList: true
				};
			};
			account: true
		}
		}
	}
  }>

export interface IBudgetBanksChartAnalytics {
	id: string
	bankName: string
	usdValue: number
	bankUsdValue?: number
	accountId: string
}

export type BudgetDraftWithRelations = Prisma.BudgetPlanDraftGetPayload<{
	include: {
		client: true
		budgetPlanBankAccounts: {
			include: {
				bank: true
				account: true
			}
		}
		allocations: true
	}
}> & {
	totalBanks: number
}

export type TSyncGetBudgets = {
	currencyList: Array<CurrencyData>,
	budgetPlans: Array<BudgetPlanExtened>
	assets: Array<TAssetExtended>
	transactions: Array<ITransactionSelected>
	cryptoList: Array<CryptoData>
	bonds: Array<TBondSelected>
	equities: Array<TEquitySelected>
	etfs: Array<TEtfSelected>
	metalList: Array<MetalData>
}