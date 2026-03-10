/* eslint-disable complexity */
import type {
	UseMutationResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation, useQuery,
} from '@tanstack/react-query'
import {
	AxiosError,
} from 'axios'

import {
	queryKeys,
} from '../../shared/constants'
import {
	toasterService,
} from '../../services/toaster/toaster.service'
import {
	documentService,
} from '../../services/document/document.service'
import {
	FetchErrorMessages,
} from '../constants/messages.constants'
import {
	DocumentTypes,
} from '../types'
import type {
	IDocument,
	DocumentStatus,
	IPortfolioDetailsDocumentExtended,
} from '../types'
import type {
	IDocumentUpdateStatus,
	DocumentIds,
	IComplianceCheckResponse,
	IComplianceCheckTotalResponse,
} from '../../services/document/document.types'
import {
	queryClient,
} from '../../providers/query.provider'

// todo: Not working correct
// type DocumentQueryParams = {
// 	portfolioId?: string;
// 	assetId?: string;
// 	entityId?: string;
// 	requestId?: string;
// 	requestDraftId?: string;
//   }

// export enum DocumentQueryKeys {
// 	DOCUMENTS_ENTITY_PORTFOLIO = 'DOCUMENTS_ENTITY_PORTFOLIO',
// 	ASSET_DOCUMENT_LIST = 'ASSET_DOCUMENT_LIST',
// 	DOCUMENT = 'DOCUMENT',
// }

// export const useGetDocumentsByInstanceId = (
// 	type: keyof typeof queryKeys,
// 	params: DocumentQueryParams,
// ): UseQueryResult<Array<IDocument>, Error> => {
// 	const queryKey = Object.entries(params,).find(([key, value,],) => {
// 		return Boolean(value,)
// 	},)
// 	return useQuery({
// 		queryKey: [queryKeys[type], queryKey,],
// 		queryFn:  async() => {
// 			return documentService.getDocumentsBySourceId(params,)
// 		},
// 		enabled: Boolean(queryKey,),
// 	},)
// }

export const useGetDocumentsForPortfolioDetails = (
	id: string,
): UseQueryResult<Array<IPortfolioDetailsDocumentExtended>, Error> => {
	return useQuery({
		queryKey: [queryKeys.DOCUMENTS_ENTITY_PORTFOLIO, id,],
		queryFn:  async() => {
			return documentService.getDocumentsForPortfolioDetails(id,)
		},
		enabled: Boolean(id.trim(),),
	},)
}

export const useGetDocumentsByAssetId = (
	assetId: string = '',
): UseQueryResult<Array<IDocument>> => {
	return useQuery({
		queryKey: [queryKeys.ASSET_DOCUMENT_LIST, assetId,],
		queryFn:  async() => {
			return documentService.getDocumentsBySourceId({
				assetId,
			},)
		},
		enabled: Boolean(assetId,),
	},)
}

export const useGetDocumentsByEntityId = (
	entityId: string = '',
): UseQueryResult<Array<IDocument>, Error> => {
	return useQuery({
		queryKey: [queryKeys.ENTITY_DOCUMENT_LIST, entityId,],
		queryFn:  async() => {
			return documentService.getDocumentsBySourceId({
				entityId,
			},)
		},
		enabled: Boolean(entityId,),
	},)
}

export const useGetDocumentsByRequestId = (
	requestId?: number,
):	UseQueryResult<Array<IDocument>, Error> => {
	return useQuery({
		queryKey: [queryKeys.DOCUMENT, requestId,],
		queryFn:  async() => {
			return documentService.getDocumentsBySourceId({
				requestId,
			},)
		},
		enabled: Boolean(requestId,),
	},)
}

export const useGetDocumentsByClientDraftId = (
	clientDraftId?: string,
):	UseQueryResult<Array<IDocument>, Error> => {
	return useQuery({
		queryKey: [queryKeys.DOCUMENT, clientDraftId,],
		queryFn:  async() => {
			return documentService.getDocumentsBySourceId({
				clientDraftId: clientDraftId?.toString(),
			},)
		},
		enabled: Boolean(clientDraftId,),
	},)
}

export const useGetDocumentsByRequestDraftId = (
	requestDraftId?: number,
):	UseQueryResult<Array<IDocument>, Error> => {
	return useQuery({
		queryKey: [queryKeys.DOCUMENT, requestDraftId,],
		queryFn:  async() => {
			return documentService.getDocumentsBySourceId({
				requestDraftId,
			},)
		},
		enabled: Boolean(requestDraftId,),
	},)
}

export const useGetDocumentsByTransactionDraftId = (
	transactionDraftId?: number,
):	UseQueryResult<Array<IDocument>, Error> => {
	return useQuery({
		queryKey: [queryKeys.DOCUMENT, transactionDraftId,],
		queryFn:  async() => {
			return documentService.getDocumentsBySourceId({
				transactionDraftId,
			},)
		},
		enabled: Boolean(transactionDraftId,),
	},)
}

export const useGetClientDocuments = (
	id: string, status?: DocumentStatus,
): UseQueryResult<Array<IDocument>, Error> => {
	return useQuery({
		queryKey:         [queryKeys.DOCUMENT, id, status,],
		queryFn:          async() => {
			try {
				const data = await documentService.getAllClientDocuments(id, status,)
				return data
			} catch (e) {
				throw new Error(FetchErrorMessages.GET_ALL_CLIENT_DOCUMENTS_ERROR,)
			}
		},
	},)
}

export const useGetDocumentsByTransactionId = (
	transactionId?: number,
):	UseQueryResult<Array<IDocument>, Error> => {
	return useQuery({
		queryKey: [queryKeys.DOCUMENT, transactionId,],
		queryFn:  async() => {
			return documentService.getDocumentsBySourceId({
				transactionId,
			},)
		},
		enabled: Boolean(transactionId,),
	},)
}

export const useGetDocumentsForComplianceCheck = (
	id: string, status?: DocumentStatus,
): UseQueryResult<IComplianceCheckResponse, Error> => {
	return useQuery({
		queryKey:         [queryKeys.COMPLIANCE_CHECK_DOCUMENT, id, status,],
		queryFn:          async() => {
			try {
				const data = await documentService.getDocumentsForComplianceCheck(id, status,)
				return data
			} catch (e) {
				throw new Error(FetchErrorMessages.GET_ALL_CLIENT_DOCUMENTS_ERROR,)
			}
		},
	},)
}

export const useGetTotalsForComplianceCheck = (
	id: string,
): UseQueryResult<IComplianceCheckTotalResponse, Error> => {
	return useQuery({
		queryKey:         [queryKeys.COMPLIANCE_CHECK_DOCUMENT, id, status,],
		queryFn:          async() => {
			try {
				const data = await documentService.getTotalsForComplianceCheck(id,)
				return data
			} catch (e) {
				throw new Error(FetchErrorMessages.GET_ALL_CLIENT_DOCUMENTS_ERROR,)
			}
		},
	},)
}

export const useUpdateDocumentStatus = (): UseMutationResult<void, Error, IDocumentUpdateStatus> => {
	return useMutation({
		mutationFn: async(body: IDocumentUpdateStatus,): Promise<void> => {
			await documentService.updateDocumentStatus(body,)
		},
		onSuccess: async() => {
			await queryClient.invalidateQueries({
				queryKey: [queryKeys.DOCUMENT,],
			},)
			await queryClient.invalidateQueries({
				queryKey: [queryKeys.COMPLIANCE_CHECK_DOCUMENT,],
			},)
		},
	},)
}

export const useCreateDocument = (type: DocumentTypes, id?: string | number,): UseMutationResult<IDocument, Error, FormData> => {
	return useMutation({
		mutationFn:  async(body: FormData,) => {
			return documentService.addDocument(body,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message: error.response?.data.message,
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.DOCUMENT,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.DOCUMENTS_ENTITY_PORTFOLIO,],
			},)
			if (type === DocumentTypes.PORTFOLIO) {
				queryClient.invalidateQueries({
					queryKey: [queryKeys.PORTFOLIO, id,],
				},)
				queryClient.invalidateQueries({
					queryKey: [queryKeys.PORTFOLIO_LIST,],
				},)
				queryClient.invalidateQueries({
					queryKey: [queryKeys.SUB_PORTFOLIO_LIST,],
				},)
			}
			if (type === DocumentTypes.SUB_PORTFOLIO) {
				queryClient.invalidateQueries({
					queryKey: [queryKeys.PORTFOLIO, id,],
				},)
				queryClient.invalidateQueries({
					queryKey: [queryKeys.SUB_PORTFOLIO_LIST,],
				},)
			}
			if (type === DocumentTypes.CLIENT) {
				queryClient.invalidateQueries({
					queryKey: [queryKeys.CLIENT,],
				},)
			}
			if (type === DocumentTypes.ASSET) {
				queryClient.invalidateQueries({
					queryKey: [queryKeys.ASSET,],
				},)
				queryClient.invalidateQueries({
					queryKey: [queryKeys.ASSET_DOCUMENT_LIST, id,],
				},)
			}
			if (type === DocumentTypes.ENTITY) {
				queryClient.invalidateQueries({
					queryKey: [queryKeys.ENTITY_DOCUMENT_LIST,],
				},)
			}
			if (type === DocumentTypes.TRANSACTION) {
				queryClient.invalidateQueries({
					queryKey: [queryKeys.TRANSACTION, id,],
				},)
				queryClient.invalidateQueries({
					queryKey: [queryKeys.TRANSACTION_DRAFT, id,],
				},)
			}
		},
	},)
}

export const useDeleteDocument = (type: DocumentTypes, id?: string,): UseMutationResult<unknown, Error, string> => {
	return useMutation({
		mutationFn: async(id: string,) => {
			return documentService.deleteDocument(id,)
		},
		onSuccess:  async() => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.DOCUMENTS_ENTITY_PORTFOLIO,],
			},)
			if (type === DocumentTypes.CLIENT) {
				await queryClient.invalidateQueries({
					queryKey: [queryKeys.DOCUMENT,],
				},)
			}
			if (type === DocumentTypes.PORTFOLIO) {
				queryClient.invalidateQueries({
					queryKey: [queryKeys.PORTFOLIO,id,],
				},)
			}
		},
		onError: async(error: AxiosError | Error,) => {
			const message = error instanceof AxiosError ?
				error.response?.data.message :
				error.message
			await toasterService.showErrorToast({
				message,
			},)
		},
	},)
}

export const useDeleteDocumentsByIds = (sourceId: string | number = '',)
	: UseMutationResult<void, Error, DocumentIds> => {
	return useMutation({
		mutationFn:  async(ids: DocumentIds,) => {
			return documentService.deleteDocumentsByIds(ids,)
		},
		async onError(error,) {
			if (error instanceof AxiosError) {
				await toasterService.showErrorToast({
					message: error.response?.data.message,
				},)
			} else {
				await toasterService.showErrorToast({
					message: error.message,
				},)
			}
		},
		onSuccess() {
			if (sourceId) {
				queryClient.invalidateQueries({
					queryKey: [queryKeys.DOCUMENT, sourceId,],
				},)
			}
			queryClient.invalidateQueries({
				queryKey: [queryKeys.DOCUMENTS_ENTITY_PORTFOLIO,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ASSET_DOCUMENT_LIST,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.ENTITY_DOCUMENT_LIST,],
			},)
		},
	},)
}

export const useGetDownloadDocument = (): UseMutationResult <{url: string}, Error, {storageName: string}> => {
	return useMutation({
		mutationFn: async(body: {storageName: string},): Promise<{url: string}> => {
			try {
				const data = await documentService.downloadDocument(body,)
				return data
			} catch (error) {
				const errorMessage = error instanceof AxiosError && error.response?.data?.message ?
					error.response.data.message :
					'Failed to download document.'
				throw new Error(errorMessage,)
			}
		},
	},)
}