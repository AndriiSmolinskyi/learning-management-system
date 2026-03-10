/* eslint-disable multiline-ternary */
import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
	montserratMidbold,
	spaces,
	montserratMediumReg,
	customScrollbar,
} from '../../../../shared/styles'
import {
	Classes,
} from '@blueprintjs/core'

export const clientWrapper = css`
	width: 100%;
`
export const clientContainer = css`
    width: 100%;
	background-color: var(--base-white);
	border-top-left-radius: 26px;
    border-bottom-left-radius: 26px;
`

export const clientHeader = css`
	height: 82px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0px 20px;
`

export const clientHeaderLeft = css`
	display: flex;
	align-items: center;
	gap: 8px;
`

export const clientHeaderRight = css`
	display: flex;
	align-items: center;
	gap: 12px;
`

export const clientTitle = css`
	${montserratSemibold}
	font-size: 26px;
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

export const headerClientList = css`
	height: 44px;
	display: grid;
	grid-template-columns: 3.93fr 2.72fr 1.81fr 1.28fr 1.28fr 0.72fr;
	background-color: var(--primary-25);
	border: 1px solid var(--primary-100);
	padding: ${spaces.smallMedium} ${spaces.medium};
	margin-left: -0.5px;
	padding-right: 28px;
`
export const headerClientListItem = css`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 0;
	margin: 0;
	${montserratMidbold}
	color: var(--gray-600);
	font-size: 12px;
`

export const headerClientListItemPointer = css`
	cursor: pointer;
`

export const listBlock = css`
   padding: 0;
	margin: 0;
	max-height:  calc(100vh - 227px);
	min-height: 0;
	overflow-y: auto;
	 ${customScrollbar}
`

export const bodyClientList = (isMutating?: boolean,): string => {
	return css`
	display: grid;
	grid-template-columns: 3.93fr 2.72fr 1.81fr 1.28fr 1.28fr 0.72fr;
	grid-auto-rows: 56px;
	padding: 0px ${spaces.medium};
	border-bottom: 1px solid var(--primary-100);
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
			  ` : css`
					background-color: var(--base-white);
			  `}
	&:last-child {
		border-bottom: none;
	}
		
	&:hover {
		cursor: pointer;
	}

`
}

export const bodyMockupClientItem = css`
	display: grid;
	grid-template-columns: 3.93fr 2.72fr 1.81fr 1.28fr 1.28fr 0.72fr;
	grid-auto-rows: 56px;
	padding: 0px ${spaces.medium};
	border-bottom: 1px solid var(--primary-100);
	animation: blinkRow 0.75s infinite alternate;		
		@keyframes blinkRow {
			from {
				background-color: var(--base-white);
			}
			to {
				background-color: var(--primary-100);
			}
		}
	&:last-child {
		border-bottom: none;
	}
		
	&:hover {
		cursor: pointer;
	}

`

export const bodyClientListItem = css`
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 0;
	margin: 0;
	& div {
		outline: none !important;
	}
	background-color: transparent;
`
export const bodyClientListItemName = (isActivated: boolean,): string => {
	return css`
	${montserratMidbold}
	font-size: 14px;
	color: ${isActivated ? 'var(--gray-800)' : 'var(--gray-500)'};
	max-width: 320px;
	white-space: nowrap;
	overflow: hidden;
   text-overflow: ellipsis;
`
}

export const bodyClientListItemText = (isActivated: boolean,): string => {
	return css`
	${montserratMediumReg}
	font-size: 14px;
	color:  ${isActivated ? 'var(--gray-600)' : 'var(--gray-400)'};
	white-space: nowrap;
	overflow: hidden;
   text-overflow: ellipsis;
`
}

export const blur = css`
	position: fixed;
    width: 100%;
    height: 100%;
	z-index: 10;
	top: 0;
	right: 0;
`

export const moreBlockItem = css`
	display: flex;
	padding: 12px 16px;
	align-items: center;
	gap: ${spaces.small};
	cursor: pointer;
`
export const moreBlocItemkRestore = css`
	${moreBlockItem}
	border-bottom: 1px solid var(--primary-100);
	border-radius: 10 10 0px 0px;
`

export const moreBlocItemkDeactivate = css`
	${moreBlockItem}
	border-top: 1px solid var(--primary-100);
	border-radius: 0 0 10px 10px;
`

export const moreBlockItemText = css`
	${montserratMidbold}
	font-size: 14px;
	color: var(--primary-600);
`

export const leftArrow = css`
  .left_arrow {
    fill: #1D57C3;
  }
`

export const rightArrow = css`
  .right_arrow {
    fill: #1D57C3;
  }
`

export const clientHeaderListText = css`
  	${montserratMidbold}
	font-size: 12px;
	color: var(--gray-600);
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

export const filterButton = (isOpen: boolean, hasFilters?: boolean,): string => {
	return css`
	  position: relative;
	  z-index: ${isOpen ?
		33 :
		0};
  
  ${hasFilters && `
		position: relative;
		z-index: 100;
	`}
	${hasFilters && `&::after {
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

export const filterOverlay = css`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
`

export const filterContainer = css`
	background: #fff;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	position: relative;
`

export const draftContainer = css`
	width: 100%;
	height: 56px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--gray-25);
	border-bottom: 1px solid var(--primary-100);
`

export const draft = css`
	display: flex;
`

export const draftName = css`
	${montserratMidbold}
	font-size: 14px;
	color: var(--gray-800);
`

export const draftLast = css`
	${montserratMediumReg}
	font-size: 12px;
	color: var(--gray-600);
`

export const draftIcon = css`
	margin-right: ${spaces.medium};
	width: 32px;
	height: 32px;
`

export const draftBtns = css`
	 display: flex;
	 margin-left: ${spaces.mid20};
	 gap: ${spaces.smallMedium};
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
    padding: 4px 0px;
    width: 100%;
`

export const popoverBackdrop = css`
    outline: none !important;
    background-color: var(--transparency-bg10) !important;
    & div {
        outline: none !important;
    }
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

export const actionBtn = css`
	padding: 0 16px;
	gap: 8px;
	width: 100%;
	justify-content: flex-start;
`

export const dotsButton = (isPopoverShown: boolean,): string => {
	return css`
        ${isPopoverShown && `
            position: relative;
            z-index: 100;
        `}
        & svg {
            & path {
                fill: var(--gray-700);
            }
        }
    `
}

export const deactivateBtn = css`
	border-top: 1px solid var(--primary-100);
`

export const activateBtn = css`
	border-bottom: 1px solid var(--primary-100);
`

export const sortArrows = (rotate?: boolean,): string => {
	return css`
	cursor: pointer;
	rotate: ${rotate ? '180deg' : '0deg'};
	width: 24px;
	height: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
`
}

export const dotAnimation = (): string => {
	return css`
	display: inline-block;
	width: 1.5em;
	overflow: hidden;
	vertical-align: bottom;

	&::after {
		content: '...';
		display: inline-block;
		animation: dots 1.5s steps(4, end) infinite;
	}

	@keyframes dots {
		0% {
			content: '';
		}
		25% {
			content: '.';
		}
		50% {
			content: '..';
		}
		75% {
			content: '...';
		}
		100% {
			content: '';
		}
	}
`
}
