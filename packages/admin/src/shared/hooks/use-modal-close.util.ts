import type React from 'react'
import {
	useEffect, useCallback,
} from 'react'

export const useModalClose = (
	setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
): { handleMenuBackdropClick: (e: React.MouseEvent<HTMLDivElement>) => void } => {
	const handleCloseClick = useCallback((e: KeyboardEvent,): void => {
		if (e.code !== 'Escape') {
			return
		}
		setIsModalOpen(false,)
	}, [setIsModalOpen,],)
	const handleMenuBackdropClick = (e: React.MouseEvent<HTMLDivElement>,): void => {
		if (e.target !== e.currentTarget) {
			return
		}
		setIsModalOpen(false,)
	}

	useEffect(() => {
		document.addEventListener('keydown', handleCloseClick,)
		return () => {
			document.removeEventListener('keydown', handleCloseClick,)
		}
	}, [handleCloseClick,],)
	useEffect(() => {
		document.documentElement.style.overflow = 'hidden'
		document.body.style.overflow = 'hidden'
		return () => {
			document.documentElement.style.overflow = 'auto'
			document.body.style.overflow = 'auto'
		}
	}, [],)
	return {
		handleMenuBackdropClick,
	}
}
