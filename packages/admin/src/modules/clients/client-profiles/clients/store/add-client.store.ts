import {
	create,
} from 'zustand'

import type {
	ClientStoreValues,
	StepsType,
} from '../clients.types'

type AddClientState = {
	step: StepsType
	values: ClientStoreValues
	draftId?: string
}

type AddClientActions = {
	setStep: (number: StepsType) => void
	setValues: (value: Partial<ClientStoreValues>) => void
	setEmails: () => void
	setContacts: () => void
	resetStore: () => void
	setDraftId: (draftId?: string) => void
}

const initialState: AddClientState = {
	step:   1,
	values: {
		firstName:      '',
		lastName:       '',
		email:          '',
		emails:         [],
		contact:        '',
		contacts:       [],
		residence:      '',
		country:        '',
		region:         '',
		city:           '',
		streetAddress:  '',
		buildingNumber: '',
		postalCode:     '',
	},
	draftId: undefined,
}

export const useAddClientStore = create<AddClientState & AddClientActions>()((set,) => {
	return {
		...initialState,
		setStep: (step,): void => {
			set({
				step,
			},)
		},
		setValues: (newValue,): void => {
			set(({
				values,
			},) => {
				return {
					values: {
						...values,
						...newValue,
					},
				}
			},)
		},
		setEmails: (): void => {
			set(({
				values,
			},) => {
				return {
					values: {
						...values,
						emails: [...values.emails, values.email,],
						email:  '',
					},
				}
			},)
		},
		setContacts: (): void => {
			set(({
				values,
			},) => {
				return {
					values: {
						...values,
						contacts: [...values.contacts, values.contact,],
						contact:  '',
					},
				}
			},)
		},
		setDraftId: (draftId?: string,): void => {
			set({
				draftId,
			},)
		},
		resetStore: (): void => {
			set(initialState,)
		},
	}
},)