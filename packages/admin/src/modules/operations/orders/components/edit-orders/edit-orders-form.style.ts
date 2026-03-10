import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
} from '../../../../../shared/styles'

export const orderDetails = css`

`

export const orderDetailsTitle = css`
	${montserratMidbold}
	font-size: 14px;
	color: var(--gray-800);
`

export const orderDetailsSuccess = css`
    background-color: var(--green-25);
`

export const orderDetailsError = css`
    background-color: var(--gray-25);
`

export const orderDetailsHeader = css`
	display: flex;
	 padding: 8px;
    border-radius: 12px;
    justify-content: space-between;
    align-items: center;
	 background-color: var(--gray-25);
`

export const orderDetailsHeaderReq = css`
    display: flex;
    gap: 6px;
    font-size: 14px;
    color: var(--gray-800);
    ${montserratMidbold}
`

export const orderDetailsHeaderStatus = css`
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--gray-800);
`

export const orderDetailsForm = css`
	display: flex;
   flex-direction: column;
	background-color: var(--primary-50);
	padding: 8px;
   border-radius: 12px;
   gap: 20px;
   padding: 8px;
`

export const orderDetailsItem = css`
	position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
`

export const orderUnitsLabel = css`
	position: absolute;	
	top: 0px;
	right: 0px;
   font-size: 14px;
   color: var(--gray-600);
   ${montserratMidbold}
`

export const orderDetailsLabel = css`
    font-size: 14px;
    color: var(--gray-600);
    ${montserratMidbold}
`

export const orderDetrailsTrash = css`
    & path {
		fill: var(--error-600);
	}
`

export const orderDetailsCont = css`
    width: 298px;
`

export const orderDetailsBtns = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

export const orderDetailsStatusBlock = css`
    display: flex;
    justify-content: space-between;
    margin-top: 2px;
`