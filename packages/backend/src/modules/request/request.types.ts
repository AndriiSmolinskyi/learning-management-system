import type {
	Account,
	Asset,
	Bank,
	Client,
	Document,
	Entity,
	Portfolio,
	Request,
	RequestDraft,
	AssetBond,
	AssetEquity,
} from '@prisma/client'

import type { PaginationResult, } from '../../shared/types'

export enum RequestStatusType {
	NOT_STARTED = 'Not started',
	IN_PROGRESS = 'In progress',
	SENT_TO_CLIENT = 'Sent to client',
	SIGNED = 'Signed',
	CANCELED = 'Canceled',
	APPROVED = 'Approved'
}

// todo: before asset refactor
// export type TRequestExtended = Request & {
// 	documents?: Array<Document>
// 	client?: Partial<Client> | null
// 	portfolio?: Partial<Portfolio> | null
// 	entity?: Partial<Entity> | null
// 	bank?: Partial<Bank> | null
// 	account?: Partial<Account> | null
// 	asset?: Partial<Asset> | Partial<AssetBond> | Partial<AssetEquity> | null
// }

// todo: after asset refactor
export type TRequestExtended = Request & {
	documents?: Array<Document>
	client?: Partial<Client> | null
	portfolio?: Partial<Portfolio> | null
	entity?: Partial<Entity> | null
	bank?: Partial<Bank> | null
	account?: Partial<Account> | null
	asset?: Partial<Asset> | Partial<AssetBond> | Partial<AssetEquity> | null
}

export type TRequestListRes = PaginationResult<TRequestExtended>

// todo: before asset refactor
// export type TRequestDraftExtended = RequestDraft & {
// 	documents?: Array<Document>
// 	client?: Partial<Client> | null
// 	portfolio?: Partial<Portfolio> | null
// 	entity?: Partial<Entity> | null
// 	bank?: Partial<Bank> | null
// 	account?: Partial<Account> | null
// 	asset?: Partial<Asset> | null
// }
export type TRequestDraftExtended = RequestDraft & {
	documents?: Array<Document>
	client?: Partial<Client> | null
	portfolio?: Partial<Portfolio> | null
	entity?: Partial<Entity> | null
	bank?: Partial<Bank> | null
	account?: Partial<Account> | null
	asset?: Partial<Asset> | Partial<AssetBond> | Partial<AssetEquity> | null
}

export enum SortRequestFields {
	ID = 'id',
	UPDATED_AT = 'updatedAt',
}