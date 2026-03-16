import React from 'react'
import {
	useReloadOnChunkError,
} from '../shared/hooks'

interface IProps {
	children: React.ReactNode;
}

export const ErrorHandlerProvider: React.FC<IProps> = ({
	children,
},) => {
	useReloadOnChunkError()
	return <>{children}</>
}