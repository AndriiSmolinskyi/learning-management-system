import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
	montserratMidbold,
	spaces,
	montserratMediumReg,
	customScrollbar,
} from '../../../../../../shared/styles'

export const EdiContainer = css`
	width: 600px;
	min-height: 100%;
    max-height: 1000px;
    position: absolute;
    right: 0;
    background: var(--base-white);
    border-top-left-radius: 26px;
    border-bottom-left-radius: 26px;
`

export const editHeader = css`
    height: 68px;
    display: flex;
	justify-content: space-between;
    align-items: center;
    padding: ${spaces.midLarge};
    background-color: var(--primary-25);
    border-top-left-radius: 26px;
    border-bottom: 1px solid var(--primary-100);
`

export const editHeaderTitle = css`
    ${montserratSemibold}
    font-size: 18px;
    color: var(--primary-600);
`

export const editForm = css`
    max-height: 80vh;
	 background-color: var(--base-white);
    padding: ${spaces.medium};
    display: flex;
    flex-direction: column;
    gap: ${spaces.smallMedium};
    overflow-y: auto;
	 ${customScrollbar}
`

type EditFormItemProps = {
  isActive: boolean;
}

export const editFormItem = ({
	isActive,
}: EditFormItemProps,):string => {
	return css`
        padding: ${spaces.small};
        background: ${isActive ?
		'var(--primary-50)' :
		'var(--gray-25)'};
        border-radius: 12px;
`
}

export const sixStep = css`
    margin-bottom: 225px;
`

export const editFormItemHeader = css`
    display: flex;
    justify-content: space-between;
`
export const editFormItemTitle = css`
    ${montserratMidbold}
    font-size: 14px;
    color: var(--gray-800);
`

export const editFormItemText = css`
    ${montserratMediumReg}
    font-size: 12px;
    color: var(--gray-500);
`

export const editFormItemInputs = css`
    display: flex;
    flex-direction: column;
    gap: ${spaces.mid20};
    margin-top: ${spaces.medium};
`

export const editFormItemDocs = css`
   ${editFormItemInputs}
   gap: 15px;
`

export const editFormItemAdditional = css`
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

export const editFormItemAdditionalLeft = css`
    display: flex;
    align-items: center;
    gap: 8px;
`

export const editFormItemAddAnother = css`
    margin-top: 6px;
    display: flex;
    justify-content: flex-end;
`

export const editClientFooter = css`
    width: 100%;
    display: flex;
    justify-content: space-between;
    border-bottom-left-radius: 26px;
    border-top: 1px solid var(--primary-100);
    background-color: var(--primary-25);
    position: absolute;
    bottom: 0;
    padding: 16px 24px 24px 16px;
`

export const oldDocBlock = css`
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 270px;
    overflow-y: auto;
    ${customScrollbar}
`
export const oldDoc = css`
    width: 100%;
    border-radius: 14px;
    border: 1px solid var(--gray-100);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--base-white);
    padding: ${spaces.smallMedium};
    box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
    height: 60px;
`
export const oldDocLeft = css`
    display:flex;
    gap: ${spaces.smallMedium};
    align-items: center;
`
export const oldDocTextBlock = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 260px;
`
export const oldDocTextType = css`
    ${montserratMidbold}
    font-size: 12px;
    color: var(--gray-800);
    width: 260px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`
export const oldDocTextFormat = css`
    ${montserratMediumReg}
    font-size: 12px;
    color: var(--gray-500);
`
export const oldDocDelete = css`
    width: 20px;
    height: 20px;
    cursor: pointer;
    flex-shrink: 0;
`

export const docsIcon = css`
    width: 32px;
    height: 32px;
    flex-shrink: 0;
`

export const newDocumentsText = css`
${montserratMediumReg}
font-size: 14px;
line-height: 19.6px;
color: var(--gray-700);
`