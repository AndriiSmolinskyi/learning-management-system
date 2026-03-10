/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'
import {
	ClientHeader,
	ClientListHeader,
} from './'
import {
	Dialog,
	Drawer,
	Loader,
} from '../../../../../../shared/components'
import type {
	Client,
} from '../../../../../../shared/types'
import {
	RouterKeys,
} from '../../../../../../router/keys'
import {
	useActivateClient,
} from '../../../client-details/hooks'
import {
	EditClientDrawer,
} from '../../../client-details/components/edit-client/edit-client.components'
import {
	AddCommentDialog,
} from '../../../../../../shared/components'
import {
	toggleState,
} from '../../../../../../shared/utils'
import {
	ClientEmpty,
} from './client-empty.component'
import {
	ClientSearchEmpty,
} from './client-search-fall.component'
import {
	ClientListItem,
} from './client-list-item.component'
import {
	useClientDraftsList,
} from '../../hooks/use-client-draft-hook'
import {
	ClientDraftItem,
} from './client-draft-item'
import type {
	ClientDraft,
} from '../../../../../../shared/types'
import {
	useClientFilterStore,
} from '../../store/client-filter.store'
import {
	useClientsList,
} from '../../hooks'
import {
	useDebounce,
} from '../../../../../../shared/hooks'
import {
	TClientSortVariants,
} from '../../clients.types'
import {
	SortOrder,
} from '../../../../../../shared/types'
import type {
	TClientTableFilter,
} from '../../clients.types'
import {
	sortClientList,
} from '../../utils/client-sort.utils'
import {
	useRangeStore,
} from '../../../../../../store/range-slider.store'
import {
	useEditClientStore,
} from '../../../client-details/store/edit-client.store'
import {
	ClientMockupListItem,
} from './client-mockup-item.component'

import * as styles from '../../clients.style'

interface IClientsTableProps {
	openedPopovers: Record<string, boolean>
	handleMoreToggle: (clientId: string) => void
	handleIsActivatedChange?: (isActivated: boolean | undefined) => void
	handleOpenDeleteModal: (clientId: string) => void
}

export const ClientList: React.FC<IClientsTableProps> = ({
	openedPopovers,
	handleMoreToggle,
	handleIsActivatedChange,
	handleOpenDeleteModal,
},) => {
	const {
		maxValue,
	} = useRangeStore()
	const navigate = useNavigate()
	const {
		mutateAsync,
	} = useActivateClient()
	const {
		data: ClientDraftList,
	} = useClientDraftsList()
	const {
		storeFilters, resetFilterStore,
	} = useClientFilterStore()
	const {
		mutatingClients,
		resetMutatedClientIds,
	} = useEditClientStore()

	const [clientModalData, setClientModalData,] = React.useState<Client | null>(null,)
	const [commentDialogVisible, setCommentDialogVisible,] = React.useState<boolean>(false,)
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState(false,)
	const [selectedDraft, setSelectedDraft,] = React.useState<ClientDraft | null>(null,)

	const handleResume = (draft: ClientDraft,): void => {
		setSelectedDraft(draft,)
	}

	const handleViewDetailsClick = (clientId: string,): void => {
		navigate(`${RouterKeys.CLIENTS}/${clientId}`,)
	}

	const handleCloseCommentDialog = React.useCallback((): void => {
		toggleState(setCommentDialogVisible,)()
	}, [],)

	const handleEditButtonClick = (client: Client,): void => {
		setClientModalData(client,)
		setIsDrawerOpen(true,)
		handleMoreToggle(client.id,)
	}

	const handleDrawerClose = (): void => {
		setIsDrawerOpen(false,)
		setClientModalData(null,)
	}

	const handleActivate = async(id: string,): Promise<void> => {
		await mutateAsync({
			id,
			isActivated: true,
		},)
	}

	const handleDeactivate = async(id: string,): Promise<void> => {
		await mutateAsync({
			id,
			isActivated: false,
		},)
	}

	const finalFilter = useDebounce(storeFilters, 250,)
	const {
		data,
		isPending,
	} = useClientsList(finalFilter,)
	React.useEffect(() => {
		if (data) {
			resetMutatedClientIds()
		}
	}, [data,],)
	const [sortFilter, setSortFilter,] = React.useState<TClientTableFilter>({
		sortBy:    TClientSortVariants.DATE,
		sortOrder: SortOrder.DESC,
	},)

	const handleSetSortFilter = (value: TClientTableFilter,): void => {
		setSortFilter(value,)
	}

	const sortedList = sortClientList(data?.list ?? [], sortFilter,)

	const maxTotal = data?.list ?
		Math.max(
			...data.list.map((client,) => {
				return Number(client.totalAssets,) || 0
			},),
		) :
		0

	const hasFilters = Object.entries(storeFilters,).some(([key, filterValue,],) => {
		if (Array.isArray(filterValue,)) {
			if (filterValue.length === 2 && filterValue[0] === 0 && filterValue[1] === maxValue) {
				return false
			}
			return filterValue.length > 0
		}
		return filterValue !== undefined && filterValue !== false && filterValue !== ''
	},)

	const existingClientIds = sortedList.map((client,) => {
		return client.id
	},)
	const mockupClients = mutatingClients?.filter((asset,) => {
		return !existingClientIds.includes(asset.id,)
	},)
	return (
		<div className={styles.clientContainer}>
			<ClientHeader
				handleIsActivatedChange={handleIsActivatedChange}
				selectedDraft={selectedDraft}
				setSelectedDraft={setSelectedDraft}
				maxTotal={maxTotal}
			/>
			<ClientListHeader sortFilter={sortFilter} handleSetSortFilter={handleSetSortFilter}/>

			{isPending ?
				<Loader /> :
				sortedList.length > 0 ?
					(
						<div className={styles.listBlock}>
							{ClientDraftList?.list.map((draft,) => {
								return (
									<ClientDraftItem
										key={draft.id ?? ''}
										draft={draft}
										onResume={handleResume}
									/>
								)
							},)}
							{mockupClients?.map((client,) => {
								return <ClientMockupListItem key={client.id}
									client={client}/>
							},)}
							{sortedList.map((client, index,) => {
								return (
									<ClientListItem
										key={client.id}
										client={client}
										index={index}
										isActive={openedPopovers[client.id] ?? false}
										commentDialogVisible={commentDialogVisible}
										handleMoreToggle={handleMoreToggle}
										handleViewDetailsClick={handleViewDetailsClick}
										handleEditButtonClick={handleEditButtonClick}
										handleActivate={handleActivate}
										handleDeactivate={handleDeactivate}
										setClientModalData={setClientModalData}
										handleCloseCommentDialog={handleCloseCommentDialog}
										handleOpenDeleteModal={handleOpenDeleteModal}
									/>
								)
							},)}
						</div>
					) :
					!data?.list.length && ClientDraftList?.list && ClientDraftList.list.length > 0 && !hasFilters ?
						(
							<div className={styles.listBlock}>
								{ClientDraftList.list.map((draft,) => {
									return (
										<ClientDraftItem
											key={draft.id ?? ''}
											draft={draft}
											onResume={handleResume}
										/>
									)
								},)}
							</div>
						) :
						hasFilters ?
							(
								<ClientSearchEmpty clearSearch={resetFilterStore} />
							) :
							(
								<ClientEmpty />
							)}

			{clientModalData && isDrawerOpen && (
				<Drawer
					isOpen={isDrawerOpen}
					onClose={handleDrawerClose}
				>
					<EditClientDrawer
						isOpen={isDrawerOpen}
						onClose={handleDrawerClose}
						id={clientModalData.id}
					/>
				</Drawer>
			)}
			<Dialog
				open={commentDialogVisible}
				isCloseButtonShown
				onClose={handleCloseCommentDialog}
			>
				{clientModalData && (
					<AddCommentDialog
						id={clientModalData.id}
						comment={clientModalData.comment}
						onClose={handleCloseCommentDialog}
					/>
				)}
			</Dialog>
		</div>
	)
}
