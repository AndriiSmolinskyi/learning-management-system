import type * as React from 'react'

type Props = {
    setState: React.Dispatch<React.SetStateAction<number>>
    value: number
}

export const togglePagination = ({
	setState,
	value,
}: Props,) => {
	return (): void => {
		setState((prev,) => {
			return prev + value
		},)
	}
}
