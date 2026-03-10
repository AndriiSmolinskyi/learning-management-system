import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratSemibold,
	montserratMediumReg,
} from './../../../../../../shared/styles'

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
    display: flex;
    align-items: center;
    gap: ${spaces.smallMedium};
    margin-top: ${spaces.medium}; 
    width: 100%;
`

export const button = css`
    width: 100%;
`

export const cancelButton = css`
    background: linear-gradient(180deg, #F6F6F6 0%, #FFFFFF 9%, #F4F4F4 100%);
    border: 1px solid var(--gray-200);
    box-shadow: 0px 1px 2px 0px #1018280D;
    color: var(--gray-800);
`

export const selectWrapper = css`
    width: 100%;
`

export const closeIcon = css`  
    position: absolute;
    top: 20px;
    right: 20px;
    &:hover {
        cursor: pointer;
    }
`
