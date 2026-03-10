import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratSemibold,
	montserratMediumReg,
	montserratMidbold,
} from '../../../../../shared/styles'

export const clientBlur = css`
    background: var(--transparency-bg10);
    backdrop-filter: blur(2px);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 1000;
`

export const addClientContainer = css`
    width: 600px;
    min-height: 100%;
    max-height: 1000px;
    position: absolute;
    right: 0;
    background: var(--base-white);
    border-top-left-radius: 26px;
    border-bottom-left-radius: 26px;
`

export const addClientHeader = css`
    background-color: var(--primary-25);
    padding: 13px ${spaces.midLarge};
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 26px;
`

export const addTitle = css`
    ${montserratSemibold}
    color: var(--primary-600);
    font-size: 18px;
`

export const btnsContainer = css`
    border-bottom-left-radius: 26px;
    position: absolute;
    bottom: 0;
    height: 82px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${spaces.medium} ${spaces.midLarge};
    background-color: var(--primary-25);
    border-top: 1px solid var(--primary-100);
`

export const btnsLeft = css`
    display: flex;
    align-items: center;
    gap: 12px;
`

export const inputBlock = css`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 0 ${spaces.midLarge};
    padding-bottom: 20px;

`

export const adEmail = css`
    width: 100%;
    height: 44px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--base-white);
    border: 1px solid var(--gray-100);
    border-radius: 8px;
    box-sizing: border-box;
    padding: 0 12px; 
`
export const adEmailLeft = css`
    display: flex;
    align-items: center;
    gap: 8px;
`
export const docBlock = css`
    display: flex;
    justify-content: space-between;
`

export const selectedFilesBlock = css`
    margin: 0;
    padding: 0 20px;
`

export const selectedFilesList = css`
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
`

export const selectedFilesListItem = css`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

export const deleteFileSvg = css`
    cursor: pointer;
`

export const addModalBlock = css`
    width: 400px;
    padding-bottom: 16px;
    padding-top: 16px;
    background: var(--base-white);
    border-radius: 26px;
    padding: ${spaces.medium};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1000000;
    pointer-events: auto;
`

export const addModalCancel = css`
    display: inline-block;
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10001;
`

export const addModalImg = css`
    margin-bottom: 12px;
`
export const addModalTitle = css`
    ${montserratSemibold}
    font-size: 18px;
    color: var(--gray-800);
`
export const addModalText = css`
    width: 360px;
    text-align: center;
    ${montserratMediumReg}
    font-size: 14px;
    color: var(--gray-500);
    line-height: 19.6px;
    margin-top: 6px;
    padding-bottom: 16px;
`
export const addModalBtns = css`
    margin-top: 16px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    ${montserratMidbold}
    button {
      width: 178px;
    }
`
export const modalEmail = css`
    ${montserratMidbold}
`

export const viewDetails = css`
	 width: 100%;
	 margin-top: 16px;
`