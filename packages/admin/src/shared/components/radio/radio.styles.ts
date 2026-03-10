// import {
// 	css,
// } from '@emotion/css'
// import {
// 	montserratMediumReg,
// } from '../../styles'

// export const labelStyle = css`
// 	display: flex;
// 	align-items: center;
// 	gap: 8px;
// 	${montserratMediumReg}
// 	font-size: 14px;
// 	line-height: 20px;
// 	color: var(--gray-800);
// 	cursor: pointer;
// `

// export const images = css`
// 	width: 20px !important;
// 	height: 20px !important;
// `
import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
} from '../../styles'

export const labelStyle = css`
  display: grid;
  grid-template-columns: 20px 1fr;
  column-gap: 8px;
  align-items: start;
  ${montserratMediumReg}
  font-size: 14px;
  line-height: 20px;
  color: var(--gray-800);
  cursor: pointer;
`

export const iconBox = css`
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 20px;
`

export const icon = css`
  width: 20px !important;
  height: 20px !important;
`

export const text = css`
  word-break: break-word;
`
