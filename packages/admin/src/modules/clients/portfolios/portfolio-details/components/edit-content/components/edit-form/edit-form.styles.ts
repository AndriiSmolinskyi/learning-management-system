import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
	montserratMediumReg,
	spaces,
	customScrollbar,
} from '../../../../../../../../shared/styles'

export const mainWrapper = css`
    padding: ${spaces.medium};
    width: 600px;
    background-color: var(--base-white);
    overflow-y: auto;
     ${customScrollbar}
    height: calc(100% - 150px);
`

export const portfolioName = css`
   ${montserratMediumReg}
    font-size: 12px;
    line-height: 16.8px;
    color: var(--gray-500);
    display: flex;
    align-items: center;
    gap: 4px;

    & svg {
        & path {
            fill:var(--gray-500);
        }
    }
`

export const portfolioNameText = css`
    width: 300px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`

export const fieldTitle = css`
	margin-bottom: 8px !important;
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-600);
`

export const collapseArrowButton = (isOpen: boolean,): string => {
	return css`
    background-color: transparent;
    outline: none !important;
    border: none;
    transition: all 300ms ease;
    transform: ${isOpen ?
		'rotate(0deg)' :
		'rotate(180deg)'};

		& path {
			fill: ${isOpen ?
		'var(--primary-600)' :
		'var(--gray-600)'};
		}
`
}

export const formWrapper = css`
	padding: ${spaces.medium} 0px;
	display: flex;
flex-direction: column;
gap: ${spaces.medium};
`

export const collapseHeaderBlock = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
`

export const collapseBlock = (isOpen: boolean,): string => {
	return css`
    padding: ${spaces.small};
        border-radius: ${spaces.smallMedium};
        background-color: ${isOpen ?
		'var(--primary-50)' :
		'var(--gray-25)'};
    `
}

export const fieldsBlock = (isOpen: boolean,): string => {
	return css`
    margin-top: ${isOpen ?
		spaces.small :
		'0'};
	display: flex;
	flex-direction: column;
	gap: ${spaces.medium};
    max-height: ${isOpen ?
		'600px' :
		'0'};
    opacity: ${isOpen ?
		'1' :
		'0'};
    transition: all 0.3s ease-in-out;
`
}

export const topInfoText = css`
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-800);
`

export const bottomInfoText = css`
	${montserratMediumReg}
	font-size: 12px;
	line-height: 16.8px;
	text-align: left;
	color: var(--gray-500);
    width: 300px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`

export const documentWrapper = (isOpen: boolean,): string => {
	return css`
display: flex;
flex-direction: column;
gap: ${isOpen ?
		spaces.small :
		'0'};
`
}

export const oldDocBlock = css`
    display: flex;
    flex-direction: column;
    gap:4px;
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

export const editPortfolioFooter = css`
    width: 100%;
    display: flex;
    justify-content: space-between;
    border-bottom-left-radius: 26px;
    border-top: 1px solid var(--primary-100);
    background-color: var(--primary-25);
    position: absolute;
    bottom: 0;
	right: 0;
    padding: 16px 24px 24px 16px;
`

export const newDocumentsText = css`
${montserratMediumReg}
font-size: 14px;
line-height: 19.6px;
color: var(--gray-700);
`