/* eslint-disable complexity */
import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratSemibold,
	montserratMidbold,
	montserratMediumReg,
} from '../../../../../../shared/styles'
import {
	PortfolioType,
} from '../../../../../../shared/types'
import {
	Classes,
} from '@blueprintjs/core'

export const portfolioCard = (isActive: boolean | undefined,): string => {
	return css`
	width: 257px;
    max-width: 100%;
    flex: 0 0 auto;
    flex-shrink: 0;
    box-sizing: border-box;
    min-height: 161px;
    border: 1px solid var(--gray-100);
    padding: ${spaces.smallMedium};
    border-radius: 14px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
	background: ${isActive ?
		'var(--base-white)' :
		'var(--gray-50)'};
		&:hover {
		cursor: pointer;
	}
`
}

export const portfolioCardHeader = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    & div {
        outline: none !important;
    }
`

export const portfolioCardHeaderLeft = css`
    display: flex;
    align-items: center;
    gap: 8px;
`

export const portfolioCardHeaderStatus = (type: PortfolioType, isActive: boolean | undefined,): string => {
	return css`
		background: ${((): string => {
		switch (type) {
		case PortfolioType.CORPORATE:
			return isActive ?
				`linear-gradient(180deg, rgba(22, 179, 100, 0.6) 70%, rgba(22, 179, 100, 0) 100%);` :
				`linear-gradient(180deg, rgba(22, 179, 100, 0.6) 00%, rgba(22, 179, 100, 0) 100%);`
		case PortfolioType.PRIVATE:
			return isActive ?
				`linear-gradient(180deg, rgba(34, 54, 243, 0.7) 70%, rgba(34, 54, 243, 0) 100%)` :
				`linear-gradient(180deg, rgba(34, 54, 243, 0.7) 0%, rgba(34, 54, 243, 0) 100%)`
		case PortfolioType.JOINT:
			return isActive ?
				'linear-gradient(180deg, rgba(254, 97, 35, 0.7) 70%, rgba(224, 79, 22, 0) 100%)' :
				`linear-gradient(180deg, rgba(254, 97, 35, 0.7) 0%, rgba(224, 79, 22, 0) 100%)`
		default:
			return '#D3D3D3'
		}
	})()};
		border: 1px solid ${((): string => {
		switch (type) {
		case PortfolioType.CORPORATE:
			return `--green-200`
		case PortfolioType.PRIVATE:
			return `--primary-200`
		case PortfolioType.JOINT:
			return `--orange-200`
		default:
			return '#D3D3D3'
		}
	})()};
		padding: 2px 10px;
		border-radius: 16px;
		& > p {
			text-transform: capitalize;
			${montserratMidbold}
			color: var(--base-white);
			font-size: 14px;
			font-style: italic;
		}
	`
}

export const portfolioCardBody = css`
   
`

export const portfolioMainFlex = css`
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 3vh, 32px);
`
export const portfolioCardBodyBigText = (isActive: boolean | undefined,): string => {
	return css`
		color: ${isActive ?
		'var(--gray-700)' :
		'var(--gray-500)'};
    ${montserratSemibold}
    font-size: 18px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
	`
}

export const portfolioCardFooter = css`
    
`

export const portfolioCardFooterBigText = (isActive: boolean | undefined,): string => {
	return css`
    ${montserratSemibold}
    font-size: 22px;
    color: ${isActive ?
		'var(--gray-800)' :
		'var(--gray-500)'};
`
}
export const moreBtnWrapper = css`
    position: absolute;
    top: -2px;
    right: -2px;
    .${Classes.POPOVER_TRANSITION_CONTAINER} {
			inset: -28px auto auto 47px !important;
			background-color: transparent;
	}
	& div {
		outline: none !important;
	}
`

export const draftName = css`
    font-size: 14px;
    color: var(--gray-800);
    ${montserratMidbold}
    margin-top: clamp(8px, 1.5vh, 32px);
`

export const draftUpdated = css`
    font-size: 12px;
    ${montserratMediumReg}
    color: var(--gray-600)
`

export const trashIcon = css`
    width: 20px;
    height: 20px;
        & path {
            fill: var(--error-600);
        }
`

export const draftFooter = css`
    display: flex;
    gap: ${spaces.smallMedium}
`