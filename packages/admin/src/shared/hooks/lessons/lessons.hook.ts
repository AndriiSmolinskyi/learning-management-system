import type {
	UseMutationResult,
	UseQueryResult,
} from '@tanstack/react-query'
import {
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import {
	AxiosError,
} from 'axios'

import {
	toasterService,
} from '../../../services/toaster/toaster.service'
import {
	lessonsService,
} from '../../../services/lessons/lessons.service'

import type {
	CreateLessonBody,
	GetLessonsQuery,
	LessonsListReturn,
	LessonItem,
	OkResponse,
	UpdateLessonBody,
} from '../../types'
import {
	queryKeys,
} from '../../../shared/constants'

export const useLessonsList = (filter: GetLessonsQuery,): UseQueryResult<LessonsListReturn, Error> => {
	return useQuery({
		queryKey: [queryKeys.LESSONS, filter,],
		queryFn:  async(): Promise<LessonsListReturn> => {
			return lessonsService.getLessonsFiltered(filter,)
		},
	},)
}

export const useLesson = (id: string | undefined,): UseQueryResult<LessonItem, Error> => {
	return useQuery({
		queryKey: [queryKeys.LESSONS, id,],
		enabled:  Boolean(id,),
		queryFn:  async(): Promise<LessonItem> => {
			return lessonsService.getLesson(id!,)
		},
	},)
}

export const useCreateLesson = (): UseMutationResult<LessonItem, Error, CreateLessonBody> => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async(body: CreateLessonBody,): Promise<LessonItem> => {
			return lessonsService.createLesson(body,)
		},
		onSuccess(): void {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.LESSONS,],
			},)
		},
		async onError(error,): Promise<void> {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Failed to create lesson' :
					error.message,
			},)
		},
	},)
}

export const useUpdateLesson = (): UseMutationResult<LessonItem, Error, { id: string, body: UpdateLessonBody }> => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async({
			id,
			body,
		}: { id: string, body: UpdateLessonBody },): Promise<LessonItem> => {
			return lessonsService.updateLesson(id, body,)
		},
		onSuccess(data,): void {
			queryClient.setQueryData([queryKeys.LESSONS, data.id,], data,)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.LESSONS,],
			},)
		},
		async onError(error,): Promise<void> {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Failed to update lesson' :
					error.message,
			},)
		},
	},)
}

export const useDeleteLesson = (): UseMutationResult<OkResponse, Error, string> => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async(id: string,): Promise<OkResponse> => {
			return lessonsService.deleteLesson(id,)
		},
		onSuccess(result: OkResponse, id: string,): void {
			queryClient.removeQueries({
				queryKey: [queryKeys.LESSONS, id,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.LESSONS,],
			},)
		},
		async onError(error,): Promise<void> {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Failed to delete lesson' :
					error.message,
			},)
		},
	},)
}