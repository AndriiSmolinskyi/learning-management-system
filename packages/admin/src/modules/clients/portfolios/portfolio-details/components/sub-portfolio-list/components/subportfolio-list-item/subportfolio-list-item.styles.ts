/* eslint-disable complexity */
import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratSemibold,
	montserratMidbold,
} from '../../../../../../../../shared/styles'
import {
	PortfolioType,
} from '../../../../../../../../shared/types'

export const liWrapper = (isActive: boolean | undefined,): string => {
	return css`
	position: relative;
	width: 228px;
	flex-shrink: 0;
	border: 1px solid var(--gray-100);
	border-radius: 14px;
	padding: ${spaces.small};
	background: ${isActive ?
		'var(--base-white)' :
		'var(--gray-50)'};
		box-shadow: 0px 1px 2px 0px #1018280D;
		&:hover {
		cursor: pointer;
	}

`
}

export const portfolioType = (type: string, isActive: boolean | undefined,): string => {
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

export const topBlock = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
`

export const statusTypeInfoBlock = css`
	display: flex;
	align-items: center;
	gap: ${spaces.small};
	height: 24px;
`

export const infoBlock = css`
	display: flex;
	flex-direction: column;
	gap: ${spaces.small};
`

export const subName = (isActive: boolean | undefined,): string => {
	return css`
	${montserratSemibold}
	font-size: 18px;
	line-height: 25.2px;
	width: 200px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
		color: ${isActive ?
		'var(--gray-700)' :
		'var(--gray-500)'};
	`
}

export const subAssets = (isActive: boolean | undefined,): string => {
	return css`
	${montserratSemibold}
	font-size: 22px;
	line-height: 30.8px;
	color: ${isActive ?
		'var(--gray-800)' :
		'var(--gray-500)'};
`
}

export const briefcaseIcon = css`
	& path {
		fill: var(--gray-400);
	}
`

export const editHeader = css`
	height: 68px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: ${spaces.midLarge};
	background-color: var(--primary-25);
	border-top-left-radius: 26px;
	border-bottom: 1px solid var(--primary-100);
`

export const editHeaderTitle = css`
	${montserratSemibold}
	font-size: 18px;
	color: var(--primary-600);
`

export const drawerBackdrop = css`
	outline: none !important;
	background-color: var(--transparency-bg10) !important;
	& div {
		outline: none !important;
	}
`