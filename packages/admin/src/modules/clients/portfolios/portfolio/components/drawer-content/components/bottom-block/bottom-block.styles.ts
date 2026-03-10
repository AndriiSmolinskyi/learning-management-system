import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
} from '../../../../../../../../shared/styles'

export const bottomBlockWrapper = css`
	height: 82px;
	width: 100%;
	background-color: var(--primary-25);
	padding-right: 24px;
	padding-top: 16px;
	display: flex;
	justify-content: end;
	gap: 12px;
	flex-shrink: 0;
`

export const nextButtonIcon = css`
	width: 20px;
	height: 20px;
	transform: rotate(180deg);
	
	& path {
		fill: var(--base-white);
	}
`

export const skipButton = css`
height: 42px;
	${montserratMidbold}
font-size: 14px;
line-height: 19.6px;
color: var(--primary-600);
padding: 0px 18px;
outline: none !important;
border: none;
border-radius: 16px;
background-color: transparent;
transition: all 0.3s ease;

&:hover{
    background-color: var(--primary-100);
}
`
