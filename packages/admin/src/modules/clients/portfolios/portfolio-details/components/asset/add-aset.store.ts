import {
	create,
} from 'zustand'
import type {
	IAsset,
} from '../../../../../../shared/types'

type TAssetState = {
  createdAsset: IAsset| null;
  openCreatedAsset: boolean;
};

type TAssetActions = {
	setCreatedAsset: (asset: IAsset) => void;
	resetCreatedAsset: () => void;
	setOpenCreatedAsset: (isOpen: boolean) => void;
}

export const useCreatedAssetStore = create<TAssetState & TAssetActions>()((set,): TAssetState & TAssetActions => {
	return {
		createdAsset:     null,
		openCreatedAsset: false,

		setCreatedAsset: (asset: IAsset,): void => {
			set({
				createdAsset: asset,
			},)
		},

		resetCreatedAsset: (): void => {
			set({
				createdAsset:     null,
				openCreatedAsset: false,
			},)
		},

		setOpenCreatedAsset: (isOpen: boolean,): void => {
			set({
				openCreatedAsset: isOpen,
			},)
		},
	}
},)
