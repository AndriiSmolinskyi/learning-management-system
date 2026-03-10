import {
	create,
} from 'zustand'
import type {
	IAssetWithRelationsDecrypted,
} from '../../../shared/types'

type TAnalyticsState = {
	storeAsset: IAssetWithRelationsDecrypted | undefined
	storeAssetCurrentId: string | undefined
	isAssetDetailsOpen: boolean
	isAssetEditOpen: boolean
	isTransferDialogOpen: boolean
	isVersion: boolean
}
type TAnalyticsActions = {
	setStoreAsset: (storeAsset : IAssetWithRelationsDecrypted | undefined) => void
	setStoreAssetisVersion: (isVersion: boolean) => void
	setStoreAssetCurrentId: (assetId: string | undefined) => void
	setIsAssetDetailsOpen: (isAssetDetailsOpen: boolean) => void
	setIsAssetEditOpen: (isAssetEditOpen: boolean) => void
	setIsTransferDialogOpen: (isTransferDialogOpen: boolean) => void
}

export const initialState: TAnalyticsState = {
	storeAsset:           undefined,
	storeAssetCurrentId:     undefined,
	isAssetDetailsOpen:   false,
	isAssetEditOpen:      false,
	isTransferDialogOpen: false,
	isVersion:            false,
}

export const useAnalyticsLayoutStore = create<TAnalyticsState & TAnalyticsActions>()(
	(set, get,) => {
		return {
			...initialState,
			setStoreAsset: (storeAsset: IAssetWithRelationsDecrypted | undefined,): void => {
				set({
					storeAsset,
				},)
			},
			setStoreAssetisVersion: (isVersion: boolean,): void => {
				set({
					isVersion,
				},)
			},
			setStoreAssetCurrentId: (storeAssetCurrentId: string | undefined,): void => {
				set({
					storeAssetCurrentId,
				},)
			},

			setIsAssetDetailsOpen: (isAssetDetailsOpen: boolean,): void => {
				set({
					isAssetDetailsOpen,
				},)
			},
			setIsAssetEditOpen: (isAssetEditOpen: boolean,): void => {
				set({
					isAssetEditOpen,
				},)
			},
			setIsTransferDialogOpen: (isTransferDialogOpen: boolean,): void => {
				set({
					isTransferDialogOpen,
				},)
			},
		}
	},
)