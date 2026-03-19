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
	studentsService,
} from '../../../services/students/students.service'

import type {
	CreateStudentBody,
	CreateStudentReturn,
	GetStudentsQuery,
	StudentsListReturn,
	StudentItem,
	UpdateStudentBody,
	OkResponse,
} from '../../types'
import {
	queryKeys,
} from '../../../shared/constants'

export const useStudentsList = (filter: GetStudentsQuery,): UseQueryResult<StudentsListReturn, Error> => {
	return useQuery({
		queryKey: [queryKeys.STUDENTS, filter,],
		queryFn:  async() => {
			return studentsService.getStudentsFiltered(filter,)
		},
	},)
}

export const useStudent = (id: string | undefined,): UseQueryResult<StudentItem, Error> => {
	return useQuery({
		queryKey: [queryKeys.STUDENTS, id,],
		enabled:  Boolean(id,),
		queryFn:  async() => {
			return studentsService.getStudent(id!,)
		},
	},)
}

export const useCreateStudent = (): UseMutationResult<CreateStudentReturn, Error, CreateStudentBody> => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async(body: CreateStudentBody,) => {
			return studentsService.createStudent(body,)
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.STUDENTS,],
			},)
		},
		async onError(error,) {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Failed to create student' :
					error.message,
			},)
		},
	},)
}

export const useUpdateStudent = (): UseMutationResult<StudentItem, Error, { id: string, body: UpdateStudentBody }> => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async({
			id,
			body,
		}: { id: string, body: UpdateStudentBody },) => {
			return studentsService.updateStudent(id, body,)
		},
		onSuccess(data,) {
			queryClient.setQueryData([queryKeys.STUDENTS, data.id,], data,)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.STUDENTS,],
			},)
		},
		async onError(error,) {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Failed to update student' :
					error.message,
			},)
		},
	},)
}

export const useDeleteStudent = (): UseMutationResult<OkResponse, Error, string> => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async(id: string,) => {
			return studentsService.deleteStudent(id,)
		},
		onSuccess(result, id,) {
			queryClient.removeQueries({
				queryKey: [queryKeys.STUDENTS, id,],
			},)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.STUDENTS,],
			},)
		},
		async onError(error,) {
			await toasterService.showErrorToast({
				message: error instanceof AxiosError ?
					error.response?.data?.message ?? 'Failed to delete student' :
					error.message,
			},)
		},
	},)
}