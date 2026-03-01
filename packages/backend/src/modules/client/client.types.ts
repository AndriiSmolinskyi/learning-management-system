
import type {
	Asset,
	Client,
	ClientDraft,
	Transaction,
} from '@prisma/client'

import type { AddClientDto, AddDraftDto, } from './dto'
import type { PaginationResult, } from '../../shared/types'
import type { IPortfolio, } from '../portfolio/portfolio.types'

export type TClientRes = Client & {
	emails: Array<string>
	contacts: Array<string>
	totalAssets: number
	hasBudgetPlan?: boolean
	portfolios?: Array<
    IPortfolio & {
      assets: Array<Asset>
      transactions: Array<Transaction>
    }
  >
}

export type TAsyncClientRes = Client & {
	emails: Array<string>
	contacts: Array<string>
	totalAssets: number
	hasBudgetPlan?: boolean
}

export type TAsyncClientsListRes = PaginationResult<TAsyncClientRes>

export type TClientsListRes = PaginationResult<TClientRes>

export type TDraftsListRes = PaginationResult<ClientDraft>

export type TCreateClient = AddClientDto

export type TCreateDraft = AddDraftDto

export type SortOrder = 'asc' | 'desc'

export interface IFilterProps {
	sortBy?: Array<keyof TClientRes>
	sortOrder?: Array<SortOrder>
	isActivated?: string | boolean
	isDeactivated?: string | boolean
   search?: string
	range?: Array<string>
	skip?: number
	take?: number
}