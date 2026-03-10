export enum FetchErrorMessages {
	GET_ALL_CLIENT_DOCUMENTS_ERROR = 'Failed to fetch client documents',
	UPDATE_DOCUMENT_STATUS_ERROR = 'Failed to update documents status',
	DOWNLOAD_DOCUMENT_ERROR = 'Download document error',
	SAVE_DRAFT_ERROR = 'Error while saving draft!',
	ADD_CLIENT_ERROR = 'Error while adding client!',
	PORTFOLIO_CREATION_ERROR = 'Portfolio creation error',
	GET_BANK_LIST_ERROR = 'Get bank list error',
	GET_ISIN_LIST_ERROR = 'Get isin list error',
	GET_TRANSACTION_TYPE_LIST_ERROR = 'Get transaction type list error',
	GET_TRANSACTION_CATEGORY_LIST_ERROR = 'Get transaction category list error',
}

export enum FetchSuccessMessages {
	SUBPORTFOLIO_CREATED = 'Subportfolio successfully created!',
}

export enum ErrorMessages {
	DOCUMENT_FORMAT_ERROR = 'Invalid file format. Please upload a valid document!',
	DOCUMENT_SIZE_ERROR = 'File size exceeds the 50MB limit!',
}