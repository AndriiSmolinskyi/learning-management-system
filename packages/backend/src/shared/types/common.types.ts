export type Message = {
   message: string
}

export type PaginationResult<T> = {
	total: number
	list: Array<T>
}

export enum SortOrder {
	ASC = 'asc',
	DESC = 'desc'
}

export enum AssetOperationType {
	BUY = 'Buy',
	SELL = 'Sell',
}

export enum CryptoType {
	DIRECT_HOLD = 'Crypto Direct Hold',
	ETF = 'Crypto ETF',
}

export enum MetalType {
	DIRECT_HOLD = 'Metal Direct Hold',
	ETF = 'Metal ETF',
}

export const Roles = {
	INVESTMEN_ANALYST:     process.env.MSAL_INVESTMEN_ANALYST_ID,
	FAMILY_OFFICE_MANAGER: process.env.MSAL_FAMILY_OFFICE_MANAGER_ID,
	BACK_OFFICE_MANAGER:   process.env.MSAL_BACK_OFFICE_MANAGER_ID,
	BOOKKEEPER:            process.env.MSAL_BOOKKEEPER_ID,
} as const

export type RolesMetadata = {
	roles: Array<string>
	clientAccess?: boolean
}