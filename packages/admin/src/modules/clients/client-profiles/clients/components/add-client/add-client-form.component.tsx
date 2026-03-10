/* eslint-disable complexity */
import React from 'react'
import {
	Form,
} from 'react-final-form'
import {
	FirstStep,
} from './first-step.component'
import {
	SecondStep,
} from './second-step.component'
import {
	ThirdStep,
} from './third-step.component'
import {
	FourthStep,
} from './fourth-step.component'
import {
	FifthStep,
} from './fifth-step.component'
import {
	SixthStep,
} from './sixth-step.component'
import {
	useAddClientStore,
} from '../../store'
import {
	validateAddClientForm,
} from '../../utils'
import {
	useAddClient,
} from '../../hooks'
import {
	useCreateDocument,
} from '../../../../../../shared/hooks'
import type {
	ClientFormValues,
} from '../../clients.types'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import type {
	FormApi,
} from 'final-form'
import {
	DocumentTypes,
} from '../../../../../../shared/types'
import {
	useDeleteClientDraft,
} from '../../hooks/use-client-draft-hook'

type Props = {
  onClose: () => void
  toggleAddClientSuccess: () => void
  handleSetClientDataSuccess: (id: string, email: string) => void
  draft?: ClientFormValues
}

export const AddClientForm: React.FC<Props> = ({
	onClose,
	toggleAddClientSuccess,
	handleSetClientDataSuccess,
	draft,
},) => {
	const {
		draftId, values, resetStore, setValues,
	} = useAddClientStore()
	const {
		mutateAsync: handleAddClient,
	} = useAddClient()
	const {
		mutateAsync: handleAddDocument,
	} = useCreateDocument(DocumentTypes.CLIENT,)
	const {
		documents: storeDocuments, clearDocuments,
	} = useDocumentStore()
	const {
		mutateAsync: deleteDraft,
	} = useDeleteClientDraft()

	React.useEffect(() => {
		if (draftId && draft) {
			const fixedDraft = {
				...draft,
				email: draft.email ?? undefined,
			}
			setValues(fixedDraft,)
		}
	}, [draftId, setValues,],)

	const handleSubmit = async({
		email, contact, documents, ...data
	}: ClientFormValues, form: FormApi<ClientFormValues, Partial<ClientFormValues>>,): Promise<void> => {
		const {
			id,
		} = await handleAddClient({
			...data, contacts: values.contacts, emails: values.emails,
		},)
		const uploadDocuments = storeDocuments.map(async(document,) => {
			const formData = new FormData()
			formData.append('file', document.file,)
			formData.append('type', document.documentType,)
			formData.append('clientId', id,)
			await handleAddDocument(formData,)
		},)
		await Promise.all(uploadDocuments,)
		handleSetClientDataSuccess(id, values.emails[0] ?? '',)
		onClose()
		form.reset()
		clearDocuments()
		if (draftId) {
			deleteDraft(draftId,)
		}
		toggleAddClientSuccess()
		setTimeout(() => {
			resetStore()
		}, 500,)
	}

	return (
		<Form<ClientFormValues>
			onSubmit={handleSubmit}
			validate={validateAddClientForm}
			initialValues={values}
			render={({
				handleSubmit, form, errors,
			},) => {
				const firstStepHasErrors = Boolean(errors?.['lastName'] || errors?.['firstName'],)
				const secondStepHasErrors = Boolean(errors?.['email'],)
				const thirdStepHasErrors = Boolean(errors?.['contact'],)
				const fourthStepHasErrors = Boolean(errors?.['residence'],)
				const fifthStepHasErrors = Boolean(
					errors?.['country'] ||
            errors?.['region'] ||
            errors?.['city'] ||
            errors?.['streetAddress'] ||
            errors?.['buildingNumber'] ||
            errors?.['postalCode'],
				)

				return (
					<form onSubmit={handleSubmit}>
						<div>
							<FirstStep hasErrors={firstStepHasErrors} onClose={onClose} />
							<SecondStep
								hasErrors={secondStepHasErrors}
								resetField={() => {
									form.resetFieldState('email',)
								}}
								onClose={onClose}
							/>
							<ThirdStep
								hasErrors={thirdStepHasErrors}
								resetField={() => {
									form.resetFieldState('contact',)
								}}
								onClose={onClose}
							/>
							<FourthStep hasErrors={fourthStepHasErrors} onClose={onClose}/>
							<FifthStep hasErrors={fifthStepHasErrors} onClose={onClose}/>
							<SixthStep onClose={onClose} draftId={draftId}/>
						</div>
					</form>
				)
			}}
		/>
	)
}
