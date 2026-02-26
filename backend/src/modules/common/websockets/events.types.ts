import type { Asset, } from '@prisma/client'
import type { AssetNamesType, } from '../../asset/asset.types'

export type TAssetActionEvent = {
	assetName: AssetNamesType
	assetId?: string
	asset?: Asset
	portfolioId?: string
	clientId: string
}

export type TTransactionActionEvent = {
	portfolioId: string
	clientId: string
}

export type TAssetTransferEvent = {
	oldPortfolioId: string
	newPortfolioId: string
	assetName: AssetNamesType
	clientId: string
}

export type TClientDeletedEvent = {
	clientId: string
	portfolioIds?: Array<string>
	budgetIds?: Array<string>
}

export type TBudgetActionEvent = {
	clientId: string
	portfolioIds?: Array<string>
	budgetIds?: Array<string>
}

export type TPortfolioDeletion ={
	portfolioId: string,
	message?: string
	isActivated?: boolean
}