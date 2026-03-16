import {
	create,
} from 'zustand'

interface IBackdropState {
	visible: boolean
	setVisible: (visible: boolean) => void;
}

export const useBackdrop = create<IBackdropState>()((set,) => {
	return {
		visible:    false,
		setVisible: (visible: boolean,): void => {
			set({
				visible,
			},)
		},
	}
},)