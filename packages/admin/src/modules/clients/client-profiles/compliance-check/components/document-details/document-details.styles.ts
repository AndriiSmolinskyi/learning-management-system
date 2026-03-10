import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratSemibold,
	montserratMidbold,
	montserratMediumReg,
} from '../../../../../../shared/styles'

export const documentDetailsWrapper = (isOpen:boolean,): string => {
	return css`
    position: fixed;
    top: 0px;
    right: 0px;
    width: 600px;
    height: 100vh;
    border-bottom-left-radius: 26px;
    border-top-left-radius: 26px;
    box-shadow: -2px 4px 10px 0px #2A2C731F;
    background-color: var(--base-white);
    display: flex;
    flex-direction: column;

    transform: ${isOpen ?
		'translateX(0%)' :
		'translateX(100%)'}    ;
    transition: transform 0.4s ease;
    overflow-y: auto;
`
}

export const topBlock = css`
    height: 68px;
    padding: ${spaces.midLarge};
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--primary-25);
`

export const closeIcon = css`
&:hover{
  cursor: pointer;
}
`

export const topBlockText = css`
${montserratSemibold}
font-size: 18px;
line-height: 25.2px;
color: var(--primary-600);
`

export const middleBlock = css`
border-top: 1px solid var(--primary-100);
border-bottom: 1px solid var(--primary-100);
flex-grow: 1;
padding: ${spaces.medium};
display: flex;
flex-direction: column;
gap: ${spaces.medium};
`

export const bottomBlock = css`
  height: 82px;
  background-color: var(--primary-25);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spaces.medium} ${spaces.midLarge};
`

export const downloadButton = css`
  outline: none !important;
  border-radius: ${spaces.smallMedium};
  padding: ${spaces.smallMedium};
  background: var(--gradients-download-button);
  border: 1px solid var(--primary-200);
`

export const buttonBlock = css`
display: flex;
gap: ${spaces.smallMedium};
`

export const declineButoon = css`
    ${montserratMidbold}
    font-size: 14px;
    line-height: 19.6px;
    background: var(--gradients-red-button);
    border-radius: ${spaces.smallMedium};
    padding: ${spaces.smallMedium} ${spaces.mid20};
    border: 1px solid var(--error-200);
    color: var(--error-600);
    box-shadow: 0px 1px 2px 0px #1018280D;
    outline: none !important;
    display: flex;
    align-items: center;
    gap: 8px;
`

export const approveButton = css`
     ${montserratMidbold}
    font-size: 14px;
    line-height: 19.6px;
    background: var(--gradients-green-button);
    border-radius: ${spaces.smallMedium};
    padding: ${spaces.smallMedium} ${spaces.mid20};
    border: 1px solid var(--green-200);
    color: var(--green-600);
    box-shadow: 0px 1px 2px 0px #1018280D;
    outline: none !important;
    display: flex;
    align-items: center;
    gap: 8px;
`

export const folderIcon = css`
width: ${spaces.medium};
height: ${spaces.medium};
 & path {
 fill: var(--gray-400);
 }
`

export const folderName = css`
 ${montserratMediumReg}
font-size: 12px;
line-height: 16.8px;
color: var(--gray-500);
display: flex;
align-items: center;
gap: 4px;
`

export const documentBlock = css`
  width: 100%;
  height: 120px;
  border-radius: ${spaces.smallMedium};
  background: var(--gradients-download-button);
  border: 1.38px solid var(--primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${spaces.smallMedium};
`

export const fileName = css`
${montserratMediumReg}
font-size: 12px;
line-height: 16.8px;
color: var(--primary-400);
width: 300px;
text-align: center;
`

export const documentInfoBlock = css`
   width: 100%;
   height: 176px;
   border-radius: ${spaces.smallMedium};
   background: var(--gray-25);
   display: flex;
`

export const infoKeysBlock = css`
  width: 140px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`

export const infoKeyValue = css`
  ${montserratMediumReg}
  padding: ${spaces.smallMedium};
  font-size: 14px;
  line-height: 19.6px;
  color: var(--gray-500);

  &:not(:last-child) {
    border-bottom: 1px solid var(--gray-100);
  }
`

export const infoValuesBlock = css`
  width: 100%;
`

export const infoValue = css`
  ${montserratMediumReg}
  padding: ${spaces.smallMedium};
  font-size: 14px;
  line-height: 19.6px;
  color: var(--gray-700);
  
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--gray-100);
  }
`

export const commentTitle = css`
  ${montserratMediumReg}
  padding-left: ${spaces.smallMedium};
  padding-right: ${spaces.smallMedium};
  font-size: 14px;
  line-height: 19.6px;
  color: var(--gray-500);
`

export const commentInfo = css`
   ${montserratMediumReg}
   padding-left: ${spaces.smallMedium};
  padding-right: ${spaces.smallMedium};
  font-size: 14px;
  line-height: 19.6px;
  color: var(--gray-700);
  margin-top: 8px;
`