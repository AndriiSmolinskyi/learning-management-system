import {
	css,
} from '@emotion/css'

import authBackground from '../../assets/images/auth-background.jpg'

import {
	montserratRegular,
	montserratSemibold,
} from '../../shared/styles'

export const container = css`
position: relative;
display: flex;
align-items: center;
justify-content: center;
width: 100vw;
min-width: 1280px;
height: 100vh;
margin: 0 auto;
background-image: url(${authBackground});
background-size: cover;
background-repeat: no-repeat;
`

export const logo = css`
	position: absolute;
	left: 20px;
	top: 16px;
	display: flex;
	align-items: center;
`

export const logoText = css`
	font-size: 18px;
	${montserratSemibold}
	color: var(--primary-600);
`

export const innerContainer = css`
	padding: 24px 40px 0px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-direction: column;
	width: 600px;
	border-radius: 22px;
	overflow: hidden;
	background: #FFFFFFDB;
`

export const contentWrapper = css`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	width: 100%;
	background: transparent;
	margin-top: 12px;
	& > h4 {
		${montserratSemibold}
		font-size: 18px;
		line-height: 25px;
		text-align: center;
	}
	& > p {
		${montserratRegular}
		color: var(--gray-500);
		font-size: 14px;
		line-height: 20px;
		text-align: center;
		margin-top: 6px;
	}
`

export const buttonWrapper = css`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 82px;
	background: transparent;
`

export const authBtn = css`
	border-radius: 10px;
`