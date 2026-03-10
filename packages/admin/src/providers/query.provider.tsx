import React from 'react'
import {
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query'

interface IProps {
	children: React.ReactNode;
}

export const queryClient = new QueryClient(
	{
		defaultOptions: {
			queries: {
				refetchOnMount:       true,
				refetchOnWindowFocus: true,
				refetchOnReconnect:   true,
				staleTime:            20 * 1000,
			},
			mutations: {
				retry: 0,
			},
		},
	},
)

export const QueryProvider: React.FC<IProps> = ({
	children,
},) => {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	)
}