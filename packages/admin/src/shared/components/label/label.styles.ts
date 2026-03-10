/* eslint-disable complexity */
import {
	css,
} from '@emotion/css'

import {
	montserratMidbold,
} from '../../styles'

import {
	LabelColor,
	LabelSize,
} from './label.types'

export const label = (color: LabelColor, size: LabelSize,): string => {
	return css`
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 16px;
	& > p {
		color: var(--base-white);
		${montserratMidbold}
		font-style: italic;
		text-align: center;
		
	}
	${getVariant(color,)}
	${getSize(size,)}
	`
}

const getVariant = (color: LabelColor,): string => {
	switch (color) {
	case LabelColor.GRAY:
		return `
			background: linear-gradient(180deg, rgba(112, 112, 123, 0.7) 70%, rgba(112, 112, 123, 0) 100%);
			border: 1px solid var(--gray-200);
		`
	case LabelColor.BLUE:
		return `
			background: linear-gradient(180deg, rgba(34, 54, 243, 0.7) 70%, rgba(34, 54, 243, 0) 100%);
			border: 1px solid var(--primary-200);
		`
	case LabelColor.PINK:
		return `
			background: linear-gradient(180deg, rgba(217, 45, 129, 0.7) 70%, rgba(217, 45, 129, 0) 100%);
			border: 1px solid var(--pink-200);
		`
	case LabelColor.ORANGE:
		return `
			background: linear-gradient(180deg, rgba(254, 97, 35, 0.7) 70%, rgba(224, 79, 22, 0) 100%);
			border: 1px solid var(--orange-200);
		`
	case LabelColor.GREEN:
		return `
			background: linear-gradient(180deg, rgba(22, 179, 100, 0.6) 70%, rgba(22, 179, 100, 0) 100%);
			border: 1px solid var(--green-200);
		`
	case LabelColor.RED:
		return `
			background: linear-gradient(180deg, rgba(217, 45, 32, 0.7) 70%, rgba(217, 45, 32, 0) 100%);
			border: 1px solid var(--error-200);
		`
	case LabelColor.YELLOW:
		return `
			background: linear-gradient(180deg, rgba(234, 170, 8, 0.7) 70%, rgba(234, 170, 8, 0) 100%);
			border: 1px solid var(--yellow-200);
		`
	default:
		return ''
	}
}

const getSize = (size: LabelSize,): string => {
	switch (size) {
	case LabelSize.SMALL:
		return `
			height: 22px;
			padding: 0px 8px;
			& > p {
				font-size: 12px;
				line-height: 16px;
			}
		`
	case LabelSize.MEDIUM:
		return `
			height: 24px;
			padding: 0px 10px;
			& > p {
				font-size: 14px;
				line-height: 20px;
			}
		`
	case LabelSize.LARGE:
		return `
			height: 28px;
			padding: 0px 12px;
			& > p {
				font-size: 14px;
				line-height: 20px;
			}
		`
	default:
		return ''
	}
}