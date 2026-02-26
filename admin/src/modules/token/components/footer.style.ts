import {
	css,
} from '@emotion/css'
import {
	orbitronSemibold, orbitronRegular, orbitronBold,
} from '../../../shared/styles'

export const footerContainer = css` 
  max-width: 1000px;
  margin: 0 auto;
  padding: 72px 20px 40px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

export const footerTitle = css` 
	${orbitronSemibold(40,)}
 	margin-bottom: 30px;
	color: var(--green);
`

export const footerText = css`
	${orbitronRegular(15,)}
	max-width: 325px;
`

export const footerSubTitle = css`
	${orbitronBold(16,)}
`

export const footerSocial = css`
	 	margin-top: 10px;
	display: flex;
	flex-direction: column;
	gap: 4px;
`

export const rights = css`
	${orbitronRegular(13,)}
	color: var(--gray);
`

export const footerBottom = css`
	width: 100%;
	height: 66px;
	border-top: 2px solid var(--dark-gray);
`

export const footerBottomBlock = css`
	max-width: 1000px;
	height: 66px;
  	margin: 0 auto;
	display: flex;
	align-items: center;
  	padding: 0 20px;
`

