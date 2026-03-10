import type {
	AddClientProps,
	AddClientDraftProps,
} from '../../../../services/client'
import type {
	SortOrder,
} from '../../../../shared/types'

export type ClientStoreValues = Omit<AddClientProps, 'documents' | 'files'> & {
	email: string
	contact: string
}

export type ClientDraftStoreValues = Omit<AddClientDraftProps, 'documents' | 'files'> & {
	email?: string
	contact?: string
}

export type ClientFormValues = Omit<ClientStoreValues, 'documents' | 'contacts' | 'emails' | 'email' | 'contact' | 'totalAssets'> & {
	email?: string | null
	contact?: string
	documents?: {
		value?: string,
		label?: string,
	}
}

export type StepsType = 1 | 2 | 3 | 4 | 5 | 6

export type ClientFormValuesWithoutUser = Omit<ClientFormValues, 'user'>

export interface IFilterProps {
	isActivated?: boolean | undefined
	isDeactivated?: boolean | undefined
	search?: string
	range?: Array<number | null>
	sortBy?: TClientSortVariants
	sortOrder?: SortOrder
}
export enum TClientSortVariants {
	DATE = 'createdAt',
	TOTAL_ASSETS = 'totalAssets',
	NAME = 'firstName'
}

export type TClientTableFilter = {
	sortBy: TClientSortVariants | undefined
	sortOrder: SortOrder| undefined
}