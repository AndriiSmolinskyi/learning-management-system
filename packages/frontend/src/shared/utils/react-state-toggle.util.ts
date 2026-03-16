import type * as React from 'react'

export const toggleState = (setter: React.Dispatch<React.SetStateAction<boolean>>,) => {
	return (): void => {
		setter((prev,) => {
			return !prev
		},)
	}
}