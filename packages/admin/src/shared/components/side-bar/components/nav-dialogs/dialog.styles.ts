import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'

import {
	montserratRegular,
	montserratSemibold,
	montserratMidbold,
} from '../../../../styles'

export const popoverContainer = css`
	background-color: transparent !important;
	border: none !important;
	box-shadow: none !important;
	position: relative !important;
	.${Classes.POPOVER_CONTENT} {
			background-color: transparent !important;
			border: none !important;
			border-radius: 0 !important;
	}
	.${Classes.POPOVER_ARROW} {
			background-color: transparent !important;
			border: none !important;
			width: 0px !important;
			height: 0px !important;
			&::before {
				box-shadow: none !important;
			}
	}
`

export const profileDialogContainer = css`
	background-color: var(--base-white) !important;
	border-radius: 26px !important;
	border: none !important;
	width: 400px !important;
	box-shadow: -2px 4px 10px 0px #2A2C731F !important;
	backdrop-filter: blur(2px) !important;
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
	position: relative;
`

export const infoDialogContainer = css`
	background-color: var(--base-white) !important;
	border-radius: 26px !important;
	border: none !important;
	width: 250px !important;
	box-shadow: -2px 4px 10px 0px #2A2C731F !important;
	backdrop-filter: blur(2px) !important;
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
	position: absolute !important;
	top: 60px !important;
`

export const clientsDialogContainer = css`
	background-color: var(--base-white) !important;
	border-radius: 22px !important;
	border: none !important;
	width: 215px !important;
	box-shadow: -2px 4px 10px 0px #2A2C731F !important;
	backdrop-filter: blur(2px) !important;
	display: flex;
	flex-direction: column;
	padding: 16px;
`

export const infoWrapper = css`
	display: flex;
	width: calc(100% - 70px);
	gap: 10px;
	align-items: center;
`

export const avatar = css`
	width: 42px;
	height: 42px;
	border-radius: 999px;
	background-color: var(--primary-100);
	display: flex;
	align-items: center;
	justify-content: center;
	& > span {
		${montserratSemibold}
		font-size: 16px;
		line-height: 22px;
		text-align: center;
		color: var(--primary-600);
		text-transform: capitalize;
	}
`

export const info = css`
	width: calc(100% - 54px);
	display: flex;
	flex-direction: column;

	& > p {
		${montserratSemibold}
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-900);
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	& > span {
		${montserratRegular}
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-600);
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`

export const role = css`
	display: flex;
	gap: 12px;
	align-items: center;
	width: 100%;
	& > p {
		${montserratSemibold}
		font-style: italic;
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-600);
	}
	& > span {
		flex-grow: 2;
		height: 1px;
		background-color: var(--primary-100);
	}
	`

export const btnStyle = css`
	width: max-content;
	height: 42px;
	padding: 0px 18px;
	display: flex;
	align-items: center;
	gap: 8px;
	${montserratSemibold}
	font-size: 14px;
	line-height: 20px;
	color: var(--gray-600);
	border: none;
	outline: none !important;
	background-color: transparent;
	& > svg {
		fill: var(--gray-600);
	}
`

export const closeBtn = css`
	width: 36px;
	height: 36px;
	outline: none !important;
	border: none;
	background: none;
	position: absolute;
	right: 12px;
	top: 12px;
	display: flex;
	justify-content: center;
	align-items: center;
`

export const clientsBtn = css`
	width: 100%;
	height: 40px;
	justify-content: flex-start;
`

export const marginTop6 = css`
	margin-top: 6px;
`

export const clientBtnMargin = css`
	margin: 8px 0 6px 0; 
`

export const clientsHeader = css`
	${montserratSemibold}
	font-size: 18px;
	line-height: 25.2px;
	color: var(--gray-800);
`

export const buttonLinkIcon = (isActive: boolean,): string => {
	return css`
		& path {
			fill: ${isActive ?
		'var(--base-white)' :
		'var(--primary-600)'}
		}
	`
}

export const versionStyle = css`
	${montserratMidbold}
	font-size: 10px;
	color: var(--gray-400);
	font-style: italic;
`

export const bottomBlock = css`
	display: flex;
	justify-content: space-between;
	align-items: center;
`

export const clearCacheWrapper = css`
	opacity: 0;
	pointer-events: none;
	transform: translateY(4px);
	transition: opacity 0.2s ease, transform 0.2s ease;
`

export const hoverZone = css`
	position: relative;

	&:hover .clearCache {
		opacity: 1;
		pointer-events: auto;
		transform: translateY(0);
	}
`