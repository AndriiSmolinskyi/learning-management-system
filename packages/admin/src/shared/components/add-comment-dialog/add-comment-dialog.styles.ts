import {
	css,
} from '@emotion/css'

import {
	montserratMedium,
	montserratMediumReg,
	montserratSemibold,
} from '../../styles'

export const container = css`
    display: flex;
    flex-direction: column;
    width: 100%;
	 align-items: center;
	 background-color: var(--base-white);
	 width: 400px;
	 border-radius: 26px;
`

export const content = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	padding: 16px 16px 0px;
	width: 100%;
	& > div:first-child {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 6px;
		align-items: center;
	}
	& h4 {
        ${montserratSemibold}
        font-size: 18px;
        line-height: 25px;
        color: var(--gray-800);
		  text-align: center;
		}
		& p {
			${montserratMediumReg}
			text-align: center;
        font-size: 14px;
        line-height: 20px;
        color: var(--gray-500);
    }
`

export const buttonWrapper = css`
	 width: 100%;
	 padding: 16px;
	 display: flex;
	 gap: 12px;
`

export const buttonStyle = css`
	 width: calc((100% - 16px) / 2);
	 font-size: 14px;
	 line-height: 20px;
`

export const cancelBtn = css`
	 color: var(--gray-800);
	 &:hover {
		 color: var(--gray-800);
	 }
`

export const addBtn = css`
	${montserratMedium}
	&:hover {
		${montserratMedium}
	}
`