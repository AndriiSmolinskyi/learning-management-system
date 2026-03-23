import React from 'react'

interface IProps {
	children: React.ReactNode;
}

export const ErrorHandlerProvider: React.FC<IProps> = ({
	children,
},) => {
	return <>{children}</>
}