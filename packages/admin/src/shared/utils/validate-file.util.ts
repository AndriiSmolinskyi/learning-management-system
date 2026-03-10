import {
	allowedDocuments,
} from '../constants/allowed-documents.constants'
import {
	toasterService,
} from '../../services/toaster'
import {
	ErrorMessages,
} from '../constants/messages.constants'

export const validateFile = (file: File,): boolean => {
	const fileSizeLimit = 50 * 1024 * 1024
	const fileExtension = file.name.split('.',).pop()
		?.toLowerCase()

	if (!fileExtension || !allowedDocuments.includes(fileExtension,)) {
		toasterService.showErrorToast({
			message: ErrorMessages.DOCUMENT_FORMAT_ERROR,
		},)

		return false
	}

	if (file.size > fileSizeLimit) {
		toasterService.showErrorToast({
			message: ErrorMessages.DOCUMENT_SIZE_ERROR,
		},)
		return false
	}
	return true
}