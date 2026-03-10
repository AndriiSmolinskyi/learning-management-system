import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'
import {
	montserratMidbold, montserratMediumReg,
} from '../../../../shared/styles'
import checkIcon from '../../../../assets/icons/li_check.png'

export const scrollPadding = css`
	position: absolute;
	right: 0px;
	top: 0px;
	height: 45px;
	width: 12px;
	background-color: var(--primary-25);
	z-index: 2;
`

export const tableWrapper = css`
   display: flex;
   flex-direction: column;
	justify-content: space-between;
	height: 100%;
	min-height: 0;
   background-color: var(--base-white);
   border-radius: 22px;
	overflow: hidden;
	position: relative;
	overflow-x: auto;
   overflow-y: auto;
`

export const tableContainer = (items: boolean,): string => {
	return css`
	display: block;
	width: 100%;
	min-height: calc(100%);
   max-height: calc(100%);
	border-collapse: collapse;
	border-spacing: 0;
	position: relative;
	overflow-x: auto;
   overflow-y: ${items ?
		'auto' :
		'hidden'};
	&::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}

  	&::-webkit-scrollbar-thumb {
		background-color: var(--gray-300);
		border-radius: 10px;
	}

  &::-webkit-scrollbar-track {
    background-color: transparent;
	 margin-top: 38px;
  }
  
   &::-webkit-scrollbar-corner {
    background-color: transparent;
  }
`
}

export const header = css`
   background-color: var(--primary-25);
`

export const headerCell = css`
   position: sticky;
	top: 0;
   height: 44px;
	min-width: 150px;
	width: 2500px;
   padding: 0 4px;
	padding-right: 10px;
   text-align: left;
   white-space: nowrap;
   background-color: var(--primary-25);
   border-bottom: 1px solid var(--primary-100);
   border-collapse: collapse;
   border-spacing: 0;
   z-index: 1;

	  &:focus,
  &:focus-visible,
  &:active {
    outline: none;
    box-shadow: none;
	 opacity: 0.8;
  }
`

export const cellWidth44 = css`
	min-width: 100px;
	width: 100px;
	display: flex;
	justify-content: center;
	align-items: center;
`

export const tableCell = css`
	${montserratMediumReg}
	height: 44px;
	min-width: 150px;
	width: 1000px;
	padding: 0 24px 0 4px;
	text-align: left;
	font-size: 14px;
	line-height: 19.6px;
	overflow: hidden;
	text-overflow: ellipsis;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	border-bottom: 1px solid var(--primary-100);
	white-space: normal;
	word-wrap: break-word;
`

export const tableTitle = css`
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
	line-height: 16.8px;
	text-align: left;
`

export const cellContent = css`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const tableNumberField = css`
	text-align: right;
`

export const textNowrap = css`
	white-space: nowrap;
`

export const tableFooter = (items: boolean,): string => {
	return css`
	position: ${items ?
		'sticky' :
		'absolute'};
	bottom: -1px;
	height: 46px;
	background-color: var(--primary-25);
   border-top: 1px solid var(--primary-100);
`
}

export const tableBtnContainer = (isHorizontalScroll: boolean,): string => {
	return css`
	position: absolute;
	display: flex;
	align-items: center;
	right: 0px;
	bottom: ${isHorizontalScroll ?
		'11.5px' :
		'6.5px'};
	height: ${isHorizontalScroll ?
		'43.5px' :
		'39px'};
	background: var(--primary-25);
	z-index: 2;
`
}

export const totalLabel = css`
	${montserratMidbold}
	font-size: 16px;
   color: var(--primary-600);
	padding-left: 4px;
	&:hover{
		cursor: pointer;
	}
`

export const sortArrows = (rotate?: boolean,): string => {
	return css`
	cursor: pointer;
	rotate: ${rotate ?
		'180deg' :
		'0deg'};
	width: 24px;
	height: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 2;
`
}

export const flexNumber = css`
	display: flex;
	align-items: center;
	height: 100%;
	/* width: 200px; */
	justify-content: flex-end;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`

export const flex = css`
	display: flex;
	align-items: center;
	height: 100%;
`

export const clearBtn = css`
	outline: none !important;
	background: transparent !important;
	border: none !important;
	box-shadow: none !important;
`

export const dialogContainer = css`
	background-color: var(--base-white) !important;
	backdrop-filter: blur(2px) !important;
	border-radius: 16px !important;
	border: none !important;
	width: 232px !important;
	box-shadow: -2px 4px 10px 0px #2A2C731F !important;
	display: flex;
	flex-direction: column;
`

export const menuActions = css`
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding: 4px;
	width: 100%;
`

export const popoverContainer = css`
	background-color: transparent !important;
	border: none !important;
	box-shadow: none !important;
	.${Classes.POPOVER_CONTENT} {
			background-color: transparent !important;
			border: none !important;
			border-radius: 0 !important;	
			opacity: 0.97;	
	}
	.${Classes.POPOVER_ARROW} {
			background-color: transparent !important;
			border: none !important;
			width: 0px !important;
			height: 0px !important;
			&::before {
				box-shadow: none !important;
			}
	}
`

export const popoverBackdrop = css`
	outline: none !important;
	background-color: var(--transparency-bg10) !important;
	& div {
		outline: none !important;
	}
`

export const dotsButton = (isPopoverShown: boolean,):string => {
	return css`
	${isPopoverShown && `
		position: relative;
		z-index: 100;
	`
}
	& svg {
		& path {
			fill: var(--gray-700);
		}
	}
`
}

export const popoverBtn = css`
	&:hover {
		background-color: var(--primary-100);
	}
`

export const settingsRoot = css`
	position: relative;
	display: inline-flex;
	align-items: center;
`

export const settingsButton = css`
	display: inline-flex;
`

export const settingsPopover = css`
	position: absolute;
	top: calc(100% + 6px);
	right: 10;

	background: var(--base-white);
	border-radius: 10px;
	box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);

	z-index: 50;
`

export const settingsContent = css`
	padding: 10px;

	display: flex;
	flex-direction: column;
	gap: 8px;

	label {
		display: flex;
		align-items: center;
		gap: 8px;
		white-space: nowrap;
	}

	input[type='checkbox'] {
		flex: 0 0 auto;
	}
`

export const checkboxBlock = css`
	display: flex;
	align-items: center;
	gap: 6px;
	${montserratMediumReg}
	color: var(--gray-800);
	font-size: 14px;
	cursor: pointer;
`

export const hiddenCheckbox = css`
  display: none;
`

export const customCheckbox = css`
	display: inline-block;
	width: 20px;
	height: 20px;
	border-radius: 4px;
	border: 1px solid var(--gray-200);
	background-color: var(--base-white);
   box-shadow: inset 0px 2px 6px rgba(24, 39, 81, 0.1);
	position: relative; 
	display: flex;

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		background: url(${checkIcon}) no-repeat center;
		background-size: 16px 16px;
		opacity: 0;
		transition: opacity 0.15s ease-in-out;
	}

	input:checked + & {
		background: var(--gradients-button-primary-blue);
		border-color: var(--primary-600);
		box-shadow: none;
	}

		input:checked + &::before {
		opacity: 1;
	}
`

export const headerInner = css`
  display: flex;
  align-items: center;
  height: 100%;
`

export const dragHandle = css`
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`

export const tableRow = (isClicked = false, isMutating: boolean,): string => {
	return css`
	cursor: pointer;
	${isMutating ?
		css`
					animation: blinkRow 0.75s infinite alternate;
					@keyframes blinkRow {
						from {
							background-color: var(--base-white);
						}
						to {
							background-color: var(--primary-100);
						}
					}
			  ` :
		css`
					background-color: ${isClicked ?
		'var(--primary-100)' :
		'var(--base-white)'};
			  `}
	`
}