import type {
	AddClientProps,
} from '../../../../services/client'

export type ClientStoreValues = Omit<AddClientProps, 'documents' | 'files'> & {
	email: string
	contact: string
}

export type ClientFormEditValues = Omit<ClientStoreValues,
    'documents' | 'contacts' | 'emails' | 'comment' | 'user' | 'createdAt' | 'updatedAt' | 'isActivated'> & {
  email?: string | null
  contact?: string
  comment?: string | null
  createdAt?: string
  updatedAt?: string
  isActivated?: boolean
}
