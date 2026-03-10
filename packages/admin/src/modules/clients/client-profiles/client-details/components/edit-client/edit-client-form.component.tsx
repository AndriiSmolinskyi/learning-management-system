/* eslint-disable no-unused-vars */
/* eslint-disable complexity */
import React from 'react'
import {
	Form,
} from 'react-final-form'
import type {
	FormApi,
} from 'final-form'
import {
	useEditClientStore,
} from '../../store/edit-client.store'
import {
	validateEditClientForm,
} from '../../utils/edit-client.validator'
import {
	useUpdateClient,
} from '../../hooks/use-update-client.hook'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	FirstStepEdit,
} from './first-step.component'
import {
	SecondStepEdit,
} from './second-step.component'
import {
	ThirdStepEdit,
} from './third-step.component'
import {
	FourthStepEdit,
} from './fourth-step.component'
import {
	FifthStepEdit,
} from './fifth-step.component'
import type {
	Client,
} from '../../../../../../shared/types'
import type {
	ClientStoreValues,
} from '../../clients-details.types'
import type {
	ClientFormEditValues,
} from '../../edit-client.types'
import {
	Refresh,
	RefreshLite,
} from '../../../../../../assets/icons'
import {
	SixStepEdit,
} from './six-step.component'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import {
	useCreateDocument,
	useGetClientDocuments,
} from '../../../../../../shared/hooks'
import {
	useOldDocumentStore,
} from '../../store/edit-client-docs.store'
import {
	DocumentTypes,
} from '../../../../../../shared/types'
import {
	useDeleteDocumentsByIds,
} from '../../../../../../shared/hooks'
import type {
	DocumentIds,
} from '../../../../../../services/document/document.types'
import * as styles from './edit-client.style'

type Props = {
    onClose: () => void
    clientData: Client
}

export const EditClientForm: React.FC<Props> = ({
	onClose,
	clientData,
},) => {
	const {
		values,
		setValues,
		setEmails,
		setContacts,
		resetStore,
		setMutatedClientIds,
	} = useEditClientStore()
	const {
		mutate: updateClient,
	} = useUpdateClient()
	const {
		data: dataOldDocs, refetch: refetchDocuments,
	} = useGetClientDocuments(clientData.id,)
	const {
		mutateAsync : handleAddDocument,
	} = useCreateDocument(DocumentTypes.CLIENT,)
	const {
		documents: storeDocuments, clearDocuments,
	} = useDocumentStore()
	const {
		setOldDocuments,
		oldDocumentsToRemove,
	} = useOldDocumentStore()
	const {
		mutateAsync: deleteDocuments,
	} = useDeleteDocumentsByIds(clientData.id,)
	const [hasChanges, setHasChanges,] = React.useState(false,)

	React.useEffect(() => {
		if (dataOldDocs) {
			setOldDocuments(dataOldDocs,)
		}
	}, [dataOldDocs, setOldDocuments,],)
	React.useEffect(() => {
		return () => {
			clearDocuments()
		}
	}, [],)
	React.useEffect(() => {
		setValues(clientData,)
	}, [clientData, setValues,],)

	React.useEffect(() => {
		const hasDocumentChanges = storeDocuments.length > 0
		const hasOldDocumentChanges = oldDocumentsToRemove.length > 0
		const hasFormChanges = Object.keys(clientData,).some((key,) => {
			return values[key as keyof ClientStoreValues] !== clientData[key as keyof Client]
		},)

		setHasChanges(hasDocumentChanges || hasFormChanges || hasOldDocumentChanges,)
	}, [storeDocuments, oldDocumentsToRemove, values, clientData,],)

	const handleSubmit = async(formValues: ClientFormEditValues, form: FormApi<ClientFormEditValues, Partial<ClientFormEditValues>>,): Promise<void> => {
		setEmails()
		setContacts()
		setMutatedClientIds(clientData.id,)
		try {
			if (oldDocumentsToRemove.length > 0) {
				const documentIds: DocumentIds = {
					id: oldDocumentsToRemove,
				}
				await deleteDocuments(documentIds,)
			}

			if (storeDocuments.length > 0) {
				const uploadDocuments = storeDocuments.map(async(document,) => {
					const formData = new FormData()
					formData.append('file', document.file,)
					formData.append('type', document.documentType,)
					formData.append('clientId', clientData.id,)
					return handleAddDocument(formData,)
				},)
				await Promise.all(uploadDocuments,)
				await refetchDocuments()
			}
			const {
				email, contact, createdAt, updatedAt, isActivated, comment, ...updatedValues
			} = formValues

			const finalValues = {
				...updatedValues,
				contacts: values.contacts,
				emails:   values.emails,
			}

			const hasFormChanges = Object.keys(clientData,).some((key,) => {
				return values[key as keyof ClientStoreValues] !== clientData[key as keyof Client]
			},)

			if (hasFormChanges) {
				updateClient({
					id: clientData.id,
					...finalValues,
				},)
			}

			resetStore()
			form.reset()
			onClose()
		} catch (error) {
			return error
		}
		return Promise.resolve()
	}

	const handleClear = (): void => {
		setValues(clientData,)
		if (dataOldDocs) {
			setOldDocuments(dataOldDocs,)
		}
		clearDocuments()
		setHasChanges(false,)
	}

	return (
		<Form<ClientFormEditValues>
			validate={validateEditClientForm}
			onSubmit={handleSubmit}
			initialValues={values}
			render={({
				handleSubmit,
				form,
				errors,
			},) => {
				const firstStepHasErrors = Boolean(errors?.['lastName'] || errors?.['firstName'],)
				const secondStepHasErrors = Boolean(errors?.['email'],)
				const thirdStepHasErrors = Boolean(errors?.['contact'],)
				const fourthStepHasErrors = Boolean(errors?.['residence'],)
				const fifthStepHasErrors = Boolean(errors?.['country'] ||
													errors?.['region'] ||
													errors?.['city'] ||
													errors?.['streetAddress'] ||
													errors?.['buildingNumber'] ||
													errors?.['postalCode'],)
				const isEmailValid = Boolean(values.emails.length > 0,)
				const isContactValid = Boolean(values.contacts.length > 0,)
				const isValid =
					Object.keys(errors ?? {
					},).length === 0 &&
					isEmailValid &&
					isContactValid
				return (
					<form onSubmit={handleSubmit}>
						<div className={styles.editForm}>
							<FirstStepEdit
								hasErrors={firstStepHasErrors}
							/>
							<SecondStepEdit
								hasErrors={secondStepHasErrors}
								resetField={() => {
									form.resetFieldState('email',)
								}}
							/>
							<ThirdStepEdit
								hasErrors={thirdStepHasErrors}
								resetField={() => {
									form.resetFieldState('contact',)
								}}/>
							<FourthStepEdit
								hasErrors={fourthStepHasErrors}
							/>
							<FifthStepEdit
								hasErrors={fifthStepHasErrors}
							/>
							<SixStepEdit/>
						</div>
						<div className={styles.editClientFooter}>
							<Button<ButtonType.TEXT>
								type='button'
								disabled={!hasChanges}
								onClick={handleClear}
								additionalProps={{
									btnType:     ButtonType.TEXT,
									text:        'Clear',
									size:        Size.MEDIUM,
									color:       Color.SECONDRAY_GRAY,
									leftIcon: hasChanges ?
										<Refresh width={20} height={20} /> :
										<RefreshLite width={20} height={20} />,
								}}
							/>
							<Button<ButtonType.TEXT>
								type='submit'
								disabled={!hasChanges || !isValid}
								additionalProps={{
									btnType: ButtonType.TEXT,
									text:    'Save edits',
									size:    Size.MEDIUM,
								}}
							/>
						</div>
					</form>
				)
			}}
		/>
	)
}
