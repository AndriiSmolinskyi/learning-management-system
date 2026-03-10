import {
	create,
} from 'zustand'
import type {
	ClientStoreValues,
} from '../clients-details.types'
import {
	persist,
} from 'zustand/middleware'
import type {
	Client,
} from '../../../../../shared/types'

type EditClientState = {
  values: ClientStoreValues
  mutatedClientIds: Array<string> | undefined
  mutatingClients: Array<Client> | undefined
}

type EditClientActions = {
  setValues: (value: Partial<ClientStoreValues>) => void
  setEmails: () => void
  setContacts: () => void
  resetStore: () => void
  setMutatedClientIds: (id: string) => void
  resetMutatedClientIds: () => void
  removeMutatedClientId: (id: string) => void
  setMutatingClient: (client: Client) => void
  removeMutatingClient: (id: string) => void
  resetMutatingClients: () => void
}

const initialState: EditClientState = {
	mutatedClientIds: undefined,
	mutatingClients:  undefined,
	values:           {
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
		streetAddress:   '',
		buildingNumber: '',
		postalCode:     '',
	},
}

export const useEditClientStore = create<EditClientState & EditClientActions>()(
	persist(
		(set,) => {
			return {
				...initialState,
				setMutatingClient: (client: Client,): void => {
					set((prevState,) => {
						const existingClients = prevState.mutatingClients ?? []
						const alreadyExists = existingClients.some((c,) => {
							return c.id === client.id
						},)
						return {
							mutatingClients: alreadyExists ?
								existingClients :
								[...existingClients, client,],
						}
					},)
				},

				removeMutatingClient: (idToRemove: string,): void => {
					set((prevState,) => {
						return {
							mutatingClients: (prevState.mutatingClients ?? []).filter(
								(client,) => {
									return client.id !== idToRemove
								},
							),
						}
					},)
				},

				resetMutatingClients: (): void => {
					set({
						mutatingClients: undefined,
					},)
				},
				setMutatedClientIds: (id: string,): void => {
					set((prevState,) => {
						return {
							mutatedClientIds: [
								...(prevState.mutatedClientIds ?? []),
								id,
							],
						}
					},)
				},
				removeMutatedClientId: (idToRemove: string,): void => {
					set((prevState,) => {
						return {
							mutatedClientIds: (prevState.mutatedClientIds ?? []).filter(
								(id,) => {
									return id !== idToRemove
								},
							),
						}
					},)
				},
				resetMutatedClientIds: (): void => {
					set({
						mutatedClientIds: undefined,
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
						if (values.email.trim()) {
							return {
								values: {
									...values,
									emails: [...values.emails, values.email,],
									email:  '',
								},
							}
						}
						return {
							values,
						}
					},)
				},

				setContacts: (): void => {
					set(({
						values,
					},) => {
						if (values.contact.trim()) {
							return {
								values: {
									...values,
									contacts: [...values.contacts, values.contact,],
									contact:  '',
								},
							}
						}
						return {
							values,
						}
					},)
				},
				resetStore: (): void => {
					set((state,) => {
						return {
							...initialState,
							mutatedClientIds: state.mutatedClientIds,
						}
					},)
				},
			}
		},
		{
			name:       'client-edit-store',
			partialize: (state,) => {
				return {
					mutatedClientIds: state.mutatedClientIds,
					mutatingClients:  state.mutatingClients,
				}
			},
		},),)
