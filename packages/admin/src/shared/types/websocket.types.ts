import type {
	AssetNamesType, Client, IAssetExtended, IBudgetPlan,
} from './types'

export type TAssetActionEvent = {
	message: string,
	success: boolean,
	data: {
		assetName: AssetNamesType
		assetId?: string
		asset?: IAssetExtended
		portfolioId?: string
	}
}

export type TPortfolioActionEvent = {
	message: string,
	success: boolean,
	data: {
		portfolioId: string
	}
}

export type TClientActionEvent = {
	message: string,
	success: boolean,
	data?: {
		client?: Client
		clientId?: string
		portfolioIds?: Array<string>
		budgetIds?: Array<string>
	}
}

export type TBudgetActionEvent = {
	message: string,
	success: boolean,
	data?: {
		budgetId?: string
		budget?: IBudgetPlan
	}
}

export type TPortfolioEditActionEvent = {
	message: string,
	success: boolean,
	data: {
		portfolioId: string
	}
}