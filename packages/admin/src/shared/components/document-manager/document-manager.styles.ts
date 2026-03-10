import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratMidbold,
	montserratMediumReg,
} from '../../../shared/styles'

export const inputBlock = css`
    display: flex;
    flex-direction: column;
    gap: 20px;
`

export const selectedFilesList = css`
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 270px;
    overflow-y: auto;
    &::-webkit-scrollbar {
    display: none;
  }
	scrollbar-width: none;
	-webkit-overflow-scrolling: touch;
	-ms-overflow-style: none;
`

export const selectedFilesListItem = css`
    display: flex;
    align-items: center;
    border: 1px solid var(--gray-100);
    box-shadow: 0px 1px 2px 0px #1018280D;
    padding: ${spaces.smallMedium};
    border-radius: 14px;
    background-color: var(--base-white);
`
export const deleteFileSvg = css`
    cursor: pointer;
    margin-left: auto;  
`

export const docBlock = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

export const typeFormatBlock = css`
    display: flex;
    flex-direction: column;
    width: 260px;
`

export const typeText = css`
${montserratMidbold}
width: 250px;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
font-size: 12px;
line-height: 16.8px;
color: var(--gray-800);
`

export const formatText = css`
${montserratMediumReg}
font-size: 12px;
line-height: 16.8px;
color: var(--gray-500);
`
export const documentIconWrapper = css`
    width: 32px;
    height:32px;
    border-radius: ${spaces.small};
    background: var(--gradients-download-button);
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
`

export const documentIcon = css`
    width: 18px;
    height: 18px;
`
export const validateInfoBlock = css`
margin-top: 10px;
`

export const validateInfoText = css`
    ${montserratMediumReg}
    font-size: 12px;
    line-height: 16.8px;
    color: var(--gray-500);
`