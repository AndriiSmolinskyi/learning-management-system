/* eslint-disable complexity */
import React from 'react'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'

import {
	useSaveDraft,
} from '../../hooks'
import {
	useCreateDocument,
} from '../../../../../../shared/hooks'
import {
	useAddClientStore,
} from '../../store'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import {
	DocumentTypes,
} from '../../../../../../shared/types'
import {
	useUpdateClientDraft,
} from '../../hooks/use-update-client-hook'

interface ISaveDraftButtonProps {
	buttonColor?: Color
	onClose?: () => void
}

export const SaveDraftButton: React.FC<ISaveDraftButtonProps> = ({
	buttonColor = Color.NON_OUT_BLUE, onClose,
},) => {
	const {
		mutateAsync: handleSaveDraft,
	} = useSaveDraft()
	const {
		mutateAsync: handleUpdateDraft,
	} = useUpdateClientDraft()
	const {
		documents: storeDocuments, clearDocuments,
	} = useDocumentStore()
	const {
		draftId, values, resetStore,
	} = useAddClientStore()
	const {
		mutateAsync : handleAddDocument,
	} = useCreateDocument(DocumentTypes.CLIENT,)

	const disabled = !values.firstName.trim() &&
	!values.lastName.trim() &&
	!values.buildingNumber.trim() &&
	!values.city.trim() &&
	!values.country.trim() &&
	!values.contacts.length &&
	!values.emails.length &&
	!values.postalCode.length &&
	!values.region.length &&
	!values.residence.length &&
	!values.firstName.length &&
	!values.streetAddress.length

	const handleSaveDraftFn = async(): Promise<void> => {
		const filteredValues = Object.fromEntries(
			Object.entries(values,).filter(
				([key, value,],) => {
					return (
						value !== '' &&
        (!Array.isArray(value,) || value.length > 0) &&
        key !== 'email' && key !== 'contact'
					)
				},
			),
		)

		if (draftId) {
			await handleUpdateDraft({
				draftId,
				props: {
					...filteredValues,
					id:        draftId,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					contacts:  values.contacts,
					emails:    values.emails,
				},
			},)
			const uploadDocuments = storeDocuments.map(async(document,) => {
				const formData = new FormData()
				formData.append('file', document.file,)
				formData.append('type', document.documentType,)
				formData.append('clientDraftId', draftId,)
				await handleAddDocument(formData,)
			},)

			await Promise.all(uploadDocuments,)
		} else {
			const {
				id,
			} = await handleSaveDraft(filteredValues,)

			const uploadDocuments = storeDocuments.map(async(document,) => {
				const formData = new FormData()
				formData.append('file', document.file,)
				formData.append('type', document.documentType,)
				formData.append('clientDraftId', id ?? '',)
				await handleAddDocument(formData,)
			},)

			await Promise.all(uploadDocuments,)
		}
		if (onClose) {
			onClose()
			setTimeout(() => {
				resetStore()
			}, 500,)
		}
		clearDocuments()
	}

	return (
		<Button<ButtonType.TEXT>
			disabled={disabled}
			additionalProps={{
				btnType: ButtonType.TEXT,
				text:    'Save as draft',
				size:    Size.MEDIUM,
				color:   buttonColor,
			}}
			onClick={handleSaveDraftFn}
		/>
	)
}