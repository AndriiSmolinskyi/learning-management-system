export interface IBudgetPlanCreateBody {
	clientId: string
	bankAccounts: Array<{
		bankId: string
		accountIds: Array<string>
	}>
	isActivated: boolean
	name: string
}

export interface IBudgetPlanUpdateBody {
	id: string
	isActivated?: boolean
	clientId?: string
	bankAccounts?: Array<{
		bankId: string
		accountIds: Array<string>
	}>
	name?: string
}

export type TBudgetFilter = {
	clientIds?: Array<string>
	isActivated?: boolean
	search?: string
}
export interface IBudgetDraftCreateBody {
	clientId: string
	bankAccounts?: Array<{
		bankId: string
		accountIds: Array<string>
	}>
	amount?: number
	name: string
}

export interface IBudgetDraftUpdateBody extends IBudgetDraftCreateBody{
	id: string
}

export interface IBudgetBanksChartAnalytics {
	id: string
	bankName: string
	usdValue: number
}