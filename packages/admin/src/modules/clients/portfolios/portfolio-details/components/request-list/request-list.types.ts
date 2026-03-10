import type {
	IRequest,
	SortOrder,
} from '../../../../../../shared/types'

export type TRequestListFilter = {
	sortBy?: keyof Pick<IRequest, 'id' | 'updatedAt'> | undefined
	sortOrder?: SortOrder | undefined
}