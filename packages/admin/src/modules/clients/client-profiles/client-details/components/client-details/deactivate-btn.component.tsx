import React from 'react'

import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'
import {
	ReactComponent as Archive,
} from '../../../../../../assets/icons/archive-icon.svg'

import {
	useActivateClient,
} from '../../hooks'

import {
	deactivateBtnStyle,
} from './client-detail.style'

type Props = {
	id: string
}

export const DeactivateButton: React.FC<Props> = ({
	id,
},) => {
	const {
		mutateAsync, isPending,
	} = useActivateClient()

	return (
		<Button<ButtonType.TEXT>
			type='button'
			className={deactivateBtnStyle}
			disabled={isPending}
			onClick={async() => {
				await mutateAsync({
					id, isActivated: false,
				},)
			}}
			additionalProps={{
				btnType:   ButtonType.TEXT,
				text:      'Deactivate',
				size:      Size.SMALL,
				leftIcon: <Archive width={20} height={20} />,
				color:     Color.SECONDARY_RED,
			}}
		/>
	)
}