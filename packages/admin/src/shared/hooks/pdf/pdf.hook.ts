import type React from 'react'
import {
	useCallback,
} from 'react'
import {
	pdfService,
} from '../../../services/downoload-pdf/downoload-pdf.service'

type Return = {
  getPDF: () => void;
};

export const usePDFfile = (ref: React.RefObject<HTMLDivElement>,): Return => {
	const getPDF = useCallback((): void => {
		if (ref.current) {
			pdfService.getPDF(ref.current,)
		}
	}, [ref,],)
	return {
		getPDF,
	}
}
