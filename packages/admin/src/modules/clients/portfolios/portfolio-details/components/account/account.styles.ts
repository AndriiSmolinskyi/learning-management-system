import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratSemibold,
	montserratMediumReg,
	montserratMidbold,
	customScrollbar,
} from '../../../../../../shared/styles'

export const modalWrapper = css`
position: relative;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: ${spaces.medium};
	background-color: var(--base-white);
	border-radius: ${spaces.medium};
`

export const selectText = css`
	${montserratSemibold}
	font-size: 18px;
	line-height: 25.2px;
	color: var(--gray-800);
	margin-top: 12px;
	margin-bottom: 6px;
`

export const infoText = css`
	${montserratMediumReg}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-500);
	width: 344px;
	text-align: center;
	margin-bottom: ${spaces.smallMedium} !important; 
`

export const buttonBlock = css`
	width: 100%;
   display: flex;
   align-items: center;
   gap: ${spaces.smallMedium};
   margin-top: ${spaces.medium}; 
`

export const buttonSelect = css`
	width: 50% !important;
`

export const selectWrapper = css`
   width: 100%;
	display: flex;
	flex-direction: column;
	gap: 16px;
`

export const closeIcon = css`  
	position: absolute;
	top: 20px;
	right: 20px;
	&:hover {
	    cursor: pointer;
	}
`

export const container = css`
	width: 600px;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
	background-color: var(--primary-25);
	height: 100vh;
	position: relative;
	`

export const header = css`
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

export const addFormWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0px;
	height: calc(100% - 68px - 82px);
	overflow-y: auto;
	 ${customScrollbar}
	 padding-top: 3px;
`

export const fieldsContainer = css`
    height: calc(100vh - 50px - 100px);
	 background-color: var(--base-white);
    overflow-y: auto;
    ${customScrollbar}
`

export const editFormWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
	width: 100%;
	background-color: var(--base-white);
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

export const editBtnWrapper = css`
    border-bottom-left-radius: 26px;
    position: absolute;
    bottom: 0;
	 left: 0;
    height: 82px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
	 gap: 12px;
    padding: 16px 24px 16px 16px;
    background-color: var(--primary-25);
    border-top: 1px solid var(--primary-100);
`

export const addInputBlock = css`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 0 ${spaces.midLarge};
    padding-bottom: 20px;
`

export const editInputBlock = css`
    display: flex;
    flex-direction: column;
    padding: 8px;
`

export const fieldTitle = css`
	margin-bottom: 8px !important;
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-600);
`

export const title = css`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	align-items: center;
	min-height: 40px;
	& p {
		color: var(--gray-500);
		${montserratMediumReg}
		font-size: 12px;
		line-height: 18px;
	}
	& path {
		fill: var(--gray-500);
	}
`

export const accountName = css`
	max-width: 75px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

export const iconsBlockWrapper = css`
	display: flex;
	gap: ${spaces.smallMedium};
`