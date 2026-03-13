import {
	createRoot,
} from 'react-dom/client'
import type {
	Toaster,
} from '@blueprintjs/core'
import {
	OverlayToaster, Position,
} from '@blueprintjs/core'

import {
	container,
} from './toaster.styles'

export const createToaster = async(): Promise<Toaster> => {
	const toaster = await OverlayToaster.createAsync({
		className: container,
		position:  Position.BOTTOM_RIGHT,
		maxToasts: 3,
	},
	{
		domRenderer: (toaster, containerElement,) => {
			createRoot(containerElement,).render(toaster,)
		},
	},)
	return toaster
}
