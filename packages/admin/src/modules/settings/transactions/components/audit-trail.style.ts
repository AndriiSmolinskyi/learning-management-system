/* eslint-disable complexity */
import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'
import {
	montserratSemibold,
	montserratMidbold,
	montserratMediumReg,
} from '../../../../shared/styles'
import {
	customScrollbar,
} from '../../../../shared/styles'
import {
	TransactionTypeAuditType,
} from '../../../../shared/types'
import checkIcon from '../../../../assets/icons/li_check.png'

export const formContainer = css`
	width: 600px;
	border-top-left-radius: 26px;
	border-bottom-left-radius: 26px;
	background-color: var(--primary-25);
	height: 100vh;
	position: relative;
`

export const formHeader = css`
	width: 100%;
	padding: 0px 24px;
	height: 68px;
	display: flex;
	align-items: center;
	${montserratSemibold}
	font-size: 18px;
	line-height: 25px;
	color: var(--primary-600);
	border-top-left-radius: 26px;
	background-color: var(--primary-25);
`

export const detailsFormWrapper = css`
	display: flex;
	flex-direction: column;
	gap: 24px;
	padding: 16px;
	width: 100%;
	background-color: var(--base-white);
	height: calc(100vh - 68px - 58px);
	overflow-y: auto;
	${customScrollbar}
`

export const clientHeaderInput = css`
	width: calc(100% - 42px);

	div{
		border-radius: 10px;
		height: 42px !important;
	}

	 input {
        height: 42px !important;
    }
`

export const filterBlock = css`
	width: 100%;
	padding: 0px 24px;
	height: 58px;
	display: flex;
	align-items: top;
	justify-content: center;;
	gap: 12px;
	${montserratSemibold}
	font-size: 18px;
	line-height: 25px;

	background-color: var(--primary-25);
	border-bottom: 1px solid var(--primary-100);
`

export const auditItem = css`
	width: 100%;
	background-color: var(--gray-25);
	border-radius: 12px;
`

export const auditItemHeader = css`
	width: 100%;
	display: flex;
	justify-content: space-between;
	padding: 8px;
	height: 65px;
`

export const auditItemHeaderRight = css`
	display: flex;
	justify-content: space-between;
`

export const auditItemHeaderName = css`
	display: flex;
	font-size: 14px;
	color: var(--gray-800);
	${montserratMidbold}
`

export const auditItemHeaderFlex = css`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding-right: 8px;
`

export const auditItemHeaderRole = css`
	${montserratMediumReg}
	font-size: 14px;
	color: var(--gray-600);
`

export const auditItemHeaderDate = css`
	${montserratMediumReg}
	font-size: 12px;
	color: var(--gray-600);
`

export const auditLabel = (type: TransactionTypeAuditType | null,): string => {
	return css`
  padding: 2px 8px;
  border-radius: 16px;
  color: var(--base-white);
  ${montserratMidbold}
  font-size: 12px;
  font-style: italic;

  ${type === TransactionTypeAuditType.ADDED ||
  type === TransactionTypeAuditType.RELATION ||
  type === TransactionTypeAuditType.RESTORED ?
		`
      background-color: #16B36499;
      border: 1px solid var(--green-200);
    ` :
		''}

  ${type === TransactionTypeAuditType.EDITED ?
		`
      background-color: #2236F3B2;
      border: 1px solid var(--primary-200);
    ` :
		''}

  ${type === TransactionTypeAuditType.ARCHIVED ||
  type === TransactionTypeAuditType.DELETED ?
		`
      background-color: #70707BB2;
      border: 1px solid var(--gray-200);
    ` :
		''}
`
}

export const chevron = (open: boolean,): string => {
	return css`
		display: inline-flex;
		transition: transform 200ms ease;
		transform: rotate(${open ?
		180 :
		0}deg);
	`
}

export const auditItemInfo = css`
	padding: 8px;
`

export const auditItemInfoTitle = css`
	${montserratMidbold}
	color: var(--gray-500);
	font-size: 12px;
`

export const auditItemInfoText = css`
	${montserratMediumReg}
	color: var(--gray-700);
	font-size: 14px;
	padding-top: 8px;
`

export const borderBottom = css`
	border-bottom: 1px solid var(--gray-100);
`

export const filterButton = (iFilterShown: boolean, hasFilters?: boolean,):string => {
	return css`
	${iFilterShown && `
		position: relative;
		z-index: 10000000;
	`}
	& svg {
		& path {
			fill: var(--primary-600);
		}
	}
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

export const filterDialogContainer = css`
	background-color: var(--base-white) !important;
	backdrop-filter: blur(2px) !important;
	border-radius: 16px !important;
	border: none !important;
	width: 300px !important;
	box-shadow: -2px 4px 10px 0px #2A2C731F !important;
	display: flex;
	flex-direction: column;
`

export const filterDialogWrapper = css`
	display: flex;
	flex-direction: column;
	padding: 16px;
	gap: 16px;
	& h3 {
		${montserratMidbold}
		font-size: 14px;
		line-height: 20px;
		color: var(--gray-800);
	}
`

export const filterBtnWrapper = css`
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	align-items: center;
	border-top: 1px solid var(--primary-100);
	padding: 16px;
`

export const applyBtn = css`
	width: 132px;
`

export const clearBtn = css`
	width: 94px;
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

export const checkboxBlock = css`
	display: flex;
	align-items: center;
	gap: 6px;
	${montserratMediumReg}
	color: var(--gray-800);
	font-size: 14px;
	cursor: pointer;
`

export const checkboxFlex = css`
	display: flex;
	gap: 12px;
`
