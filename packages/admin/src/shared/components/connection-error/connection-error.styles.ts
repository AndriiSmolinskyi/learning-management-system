import {
	css,
} from '@emotion/css'

import authBackground from '../../../assets/images/auth-background.jpg?inline'
import {
	montserratSemibold,
} from '../../../shared/styles'

export const container = css`
position: relative;
width: 100vw;
min-width: 1280px;
height: 100vh;
margin: 0 auto;
background-image: url(${authBackground});
background-size: cover;
background-repeat: no-repeat;
background-position: center;
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

export const errorMessage = css`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	font-size: 18px;
	${montserratSemibold}
	color: var(--primary-600);
`