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
    width: 400px;
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
width: 320px;
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

export const button = css`
    width: 100%;
`