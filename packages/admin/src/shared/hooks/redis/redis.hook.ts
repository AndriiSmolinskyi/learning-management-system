import type {
	UseMutationResult,
} from '@tanstack/react-query'
import {
	useMutation,
} from '@tanstack/react-query'
import {
	redisService,
} from '../../../services/redis/redis.service'

export const useGetRedisCacheCleared = (): UseMutationResult<void, Error, void> => {
	return useMutation({
		mutationFn: async() => {
			await redisService.getRedisCacheCleared()
		},
		onSuccess: () => {
			// eslint-disable-next-line no-console
			console.log('Redis cache cleared',)
		},
	},)
}