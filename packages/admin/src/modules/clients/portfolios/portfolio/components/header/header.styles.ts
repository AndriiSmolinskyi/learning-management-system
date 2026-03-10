import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'
import {
	spaces,
	montserratSemibold,
} from './../../../../../../shared/styles'

export const headerWrapper = css`
	padding-right: ${spaces.medium};
	display: flex;
	flex-direction: flex;
    justify-content: space-between;
    padding: 20px 20px;
    background-color: var(--base-white);
    border-radius: 26px;
    box-shadow: -2px 4px 10px 0px #2A2C731F;
`

export const titleBlock = css`
display: flex;
gap: ${spaces.small};
align-items: center;
`

export const headerTitle = css`
${montserratSemibold}
font-size: 26px;
line-height: 36.4px;
color: var(--gray-800);
`

export const actionsBlock = css`
display: flex;
gap: ${spaces.smallMedium};
align-items: center;

`

export const clientHeaderInput = css`
	width: 299px;

	div{
		border-radius: 10px;
		height: 42px !important;
	}

	 input {
        height: 42px !important;
    }
`

export const inputSearchIcon = css`
    width: 20px;
    height: 20px;
    cursor: pointer;
`

export const dialog = css`
max-width: 400px;
width: 100%;
border-radius: ${spaces.medium} !important;
margin: 0px !important;
 &.bp5-overlay {
  z-index: 1070 !important;

}
.${Classes.DIALOG_BODY_SCROLL_CONTAINER} {
    border-radius: ${spaces.medium} !important;
}

.${Classes.DIALOG_CLOSE_BUTTON} {
	padding: 0;
	width: 24px;
	height: 24px;
	outline: none !important;
	&:hover {
		background-color: transparent !important;
	}
}
`

export const drawer = css`
    max-width: 560px;
    width: 100%;
    border-top-left-radius: 26px;
    border-bottom-left-radius: 26px;
`

export const filterWindowWrapper = css`
	position: relative;
`

export const filterBackdrop = css`
	z-index: 31;
	position: fixed;
	top: 0px;
	left: 0px;
	width: 100vw;
	height: 100vh;
	background: var(--transparency-bg10);
`

export const filterButton = (isOpen: boolean, hasFilters: boolean,): string => {
	return css`
	  position: relative;
	  z-index: ${isOpen ?
		33 :
		0};
  
	  ${hasFilters && !isOpen && `&::after {
		content: '';
		position: absolute;
		top: 4px;
		right: 4px;
		width: 10px;
		height: 10px;
		background: radial-gradient(81.82% 81.82% at 34.13% 29.53%, #61DEB0 0%, #44B98E 100%);
		border-radius: 50%;
	  }
	  `}
	`
}

export const drawerBackdrop = css`
	outline: none !important;
	background-color: var(--transparency-bg10) !important;
	& div {
		outline: none !important;
	}
`