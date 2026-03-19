/* eslint-disable max-lines */
/* eslint-disable multiline-ternary */
import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'
import {
	customScrollbar,
	montserratMediumReg,
	montserratMidbold,
	montserratSemibold, spaces,
} from '../../../shared/styles'

export const formContainer = css`
	width: 600px;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
	background-color: var(--primary-25);
	height: 100vh;
	position: relative;
`

export const formHeader = css`
	width: 100%;
	padding: 0px 24px;
	height: 68px;
	display: flex;
	align-items: center;
	${montserratSemibold}
	font-size: 18px;
	line-height: 25px;
	color: var(--primary-600);
	border-top-left-radius: 26px;
	background-color: var(--primary-25);
`

export const detailsItemWrapper = ({
	hasBorder = false, hasBorderRadiusTop = false, hasBorderRadiusBottom = false,
},
): string => {
	return css`
	min-height: 44px;
	border-bottom: ${hasBorder ? '1px solid var(--gray-100)' : 'none'};
	display: flex;
	align-items: center;
	width: 100%;
	background-color: var(--gray-25);
	border-top-left-radius: ${hasBorderRadiusTop ?
		'12px' :
		'0'};
	border-top-right-radius: ${hasBorderRadiusTop ?
		'12px' :
		'0'};
	border-bottom-left-radius: ${hasBorderRadiusBottom ?
		'12px' :
		'0'};
	border-bottom-right-radius: ${hasBorderRadiusBottom ?
		'12px' :
		'0'};
`
}

export const detailsItemTitle = css`
	height: 100%;
	display: flex;
	align-items: center;
	width: 140px;
	${montserratMediumReg}
	font-size: 14px;
	line-height: 20px;
	color: var(--gray-500);
	padding: 12px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	`

export const detailsItemText = css`
	height: 100%;
	display: flex;
	align-items: center;
	width: 228px;
	padding: 12px;
	& p {
		${montserratMediumReg}
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-700);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: normal;
		word-wrap: break-word;
		overflow-wrap: break-word;
		width: 100%;
	}
`

export const detailsFormWrapper = css`
	display: flex;
	flex-direction: column;
	padding: 16px;
	width: 100%;
	background-color: var(--base-white);
	height: calc(100vh - 68px - 82px);
	overflow-y: auto;
	${customScrollbar}
`

export const detailsCommentWrapper = css`
	display: flex;
	flex-direction: column;
	width: 100%;
	background-color: var(--gray-25);
	border-bottom-left-radius: 12px;
	border-bottom-right-radius: 12px;
	& p {
		${montserratMediumReg}
		padding: 12px 12px 4px 12px;
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-500);
	}
	& span {
		padding: 4px 12px 12px 12px;
		${montserratMediumReg}
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-700);
		display: -webkit-box;
		-webkit-line-clamp: 5;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: normal;
		word-wrap: break-word;
		overflow-wrap: break-word;
		width: 100%;
	}
`

export const addBtnWrapper = css`
    border-bottom-left-radius: 26px;
    position: absolute;
    bottom: 0;
    height: 82px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
	 gap: 12px;
    padding: ${spaces.medium} ${spaces.midLarge};
    background-color: var(--primary-25);
    border-top: 1px solid var(--primary-100);
`