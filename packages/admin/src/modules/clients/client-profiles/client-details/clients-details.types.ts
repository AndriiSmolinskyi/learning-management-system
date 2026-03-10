import type {
	AddClientProps,
} from '../../../../services/client'
import type {
	IUser,
} from '../../../../shared/types'

export type ClientStoreValues = Omit<AddClientProps, 'documents' | 'files'> & {
	email: string
	contact: string
}

export type ClientFormValues = Omit<ClientStoreValues, 'documents' | 'contacts' | 'emails' | 'email' | 'contact' | 'comment' | 'user' | 'totalAssets'> & {
	email?: string | null
	contact?: string
	documents?: {
		value?: string,
		label?: string,
	} | null
	comment?: string | null
	user?: IUser | null
}

export type ClientFormValuesWithoutUser = Omit<ClientFormValues, 'user'>;