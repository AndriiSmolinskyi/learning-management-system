import React from 'react'

import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'
import {
	ArchiveRestore,
} from '../../../../../../assets/icons'

import {
	useActivateClient,
} from '../../hooks'

type Props = {
	id: string
}

export const ActivateButton: React.FC<Props> = ({
	id,
},) => {
	const {
		mutateAsync, isPending,
	} = useActivateClient()

	return (
		<Button<ButtonType.TEXT>
			type='button'
			disabled={isPending}
			onClick={async() => {
				await mutateAsync({
					id, isActivated: true,
				},)
			}}
			additionalProps={{
				btnType:   ButtonType.TEXT,
				text:      'Restore',
				size:      Size.SMALL,
				leftIcon: <ArchiveRestore width={20} height={20} />,
				color:     Color.SECONDARY_GREEN,
			}}
		/>
	)
}