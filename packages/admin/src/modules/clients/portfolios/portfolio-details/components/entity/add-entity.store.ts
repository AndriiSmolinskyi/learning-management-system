import {
	create,
} from 'zustand'
import type {
	IEntity,
} from '../../../../../../shared/types'

type TEntityState = {
  createdEntity: IEntity| null;
  openCreatedEntity: boolean;
};

type TEntityActions = {
	setCreatedEntity: (entity: IEntity) => void;
	resetCreatedEntity: () => void;
	setOpenCreatedEntity: (isOpen: boolean) => void;
}

export const useCreatedEntityStore = create<TEntityState & TEntityActions>()((set,): TEntityState & TEntityActions => {
	return {
		createdEntity:     null,
		openCreatedEntity: false,

		setCreatedEntity: (entity: IEntity,): void => {
			set({
				createdEntity: entity,
			},)
		},

		resetCreatedEntity: (): void => {
			set({
				createdEntity:     null,
				openCreatedEntity: false,
			},)
		},

		setOpenCreatedEntity: (isOpen: boolean,): void => {
			set({
				openCreatedEntity: isOpen,
			},)
		},
	}
},)
