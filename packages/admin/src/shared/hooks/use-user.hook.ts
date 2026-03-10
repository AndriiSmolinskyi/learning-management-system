import React from 'react'
import {
	useMsal,
} from '@azure/msal-react'
import {
	useQuery,
} from '@tanstack/react-query'

import {
	queryKeys,
} from '../constants'
import {
	msGraphServise,
} from '../../services/ms-graph'
import {
	readRequest,
} from '../../providers/msal.provider'
import {
	useUserStore,
} from '../../store/user.store'

export const useUser = async(): Promise<void> => {
	const {
		instance,
		accounts,
	} = useMsal()
	const {
		setUser,
	} = useUserStore()

	const {
		data,
	} = useQuery({
		queryKey: [queryKeys.USER, accounts[0],],
		queryFn:  async() => {
			const result = await instance
				.acquireTokenSilent({
					...readRequest,
					account: accounts[0],
				},)
			return msGraphServise.getMsUser(result.accessToken,)
		},
		refetchOnWindowFocus: false,
		staleTime:            0,
	},)

	React.useEffect(() => {
		if (data) {
			setUser({
				name:  data.displayName,
				email: data.mail,
				roles:  data.roles,
			},)
		}
	}, [JSON.stringify(data,),],)
}