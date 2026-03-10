/* eslint-disable complexity */
import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
	montserratMidbold,
} from './../../../../../../shared/styles'
import {
	PortfolioType,
} from '../../../../../../shared/types'

export const headerWrapper = css`
	padding: 20px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-radius: 26px;
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	background: var(--base-white);
`

export const infoBlock = css`
	display: flex;
	align-items: center;
	gap: 8px;
`

export const nameText = (isActivated: boolean | undefined,): string => {
	return css`
	${montserratSemibold}
	font-size: 22px;
	line-height: 30.8px;
	color: ${isActivated ?
		'var(--gray-800)' :
		'var(--gray-500)'};
	max-width: 500px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`
}

export const portfolioType = (type: PortfolioType, isActive: boolean | undefined,): string => {
	return css`
background: ${((): string => {
		switch (type) {
		case PortfolioType.CORPORATE:
			return isActive ?
				`linear-gradient(180deg, rgba(22, 179, 100, 0.6) 70%, rgba(22, 179, 100, 0) 100%);` :
				`linear-gradient(180deg, rgba(22, 179, 100, 0.6) 00%, rgba(22, 179, 100, 0) 100%);`
		case PortfolioType.PRIVATE:
			return isActive ?
				`linear-gradient(180deg, rgba(34, 54, 243, 0.7) 70%, rgba(34, 54, 243, 0) 100%)` :
				`linear-gradient(180deg, rgba(34, 54, 243, 0.7) 0%, rgba(34, 54, 243, 0) 100%)`
		case PortfolioType.JOINT:
			return isActive ?
				'linear-gradient(180deg, rgba(254, 97, 35, 0.7) 70%, rgba(224, 79, 22, 0) 100%)' :
				`linear-gradient(180deg, rgba(254, 97, 35, 0.7) 0%, rgba(224, 79, 22, 0) 100%)`
		default:
			return '#D3D3D3'
		}
	})()};
		border: 1px solid ${((): string => {
		switch (type) {
		case PortfolioType.CORPORATE:
			return `--green-200`
		case PortfolioType.PRIVATE:
			return `--primary-200`
		case PortfolioType.JOINT:
			return `--orange-200`
		default:
			return '#D3D3D3'
		}
	})()};
		padding: 2px 10px;
		border-radius: 16px;
		text-transform: capitalize;
		${montserratMidbold}
		color: var(--base-white);
		font-size: 14px;
		font-style: italic;
`
}

export const actionBlockWrapper = css`
	display: flex;
	gap: 12px;
`

export const archiveIcon = (isActivated: boolean,): string => {
	return css`
		& path {
			fill: ${isActivated ?
		'var(--error-600)' :
		'var(--success-700)'};
		}
	`
}

export const button = css`
 & span svg path {
			fill: currentColor;
 }
`