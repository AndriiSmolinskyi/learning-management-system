import {
	css,
	keyframes,
} from '@emotion/css'
import {
	montserratMediumReg,
	montserratMidbold,
} from '../../styles'

export const selectWrapper = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
`

export const selectStyle = css`
  width: 100% !important;

  .react-select__control {
    width: 100% !important;
  }
  
  .react-select__option .react-select__option-label {
    width: 200px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    flex-wrap: nowrap !important;
  }

  .react-select__control--is-focused,
  .react-select__control--menu-is-open {
    width: 100% !important;
  }

  .css-1u9des2-indicatorSeparator {
    display: none;
  }

  .css-13cymwt-control {
    border: none !important;
  }

  .css-hlgwow {
    padding: 0;
  }

  .react-select__control, 
  .react-select__control--is-focused, 
  .react-select__control--menu-is-open, 
  .css-t3ipsp-control {
    border: none;
    outline: none;
    box-shadow: none;
    background-color: transparent;
  }

  .react-select__control--menu-is-open{
    color: var(--primary-600);
  }

  ${montserratMediumReg}

 .react-select__value-container {
    display: flex;
    flex-wrap: nowrap;
	 // todo: clear if good
    /* max-width: 250px; */
	 width: 100%;
    overflow-x: auto;
    gap: 8px;
	 padding: 2px 0px;
	::-webkit-scrollbar {
    	display: none;
  	}
	scrollbar-width: none;
	-webkit-overflow-scrolling: touch;
	-ms-overflow-style: none;
  }

  	.react-select__control input {
		caret-color:  var(--primary-600);
	}

	.react-select__control input {
		caret-color: var(--primary-600); 
	}

	.react-select__option {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.react-select__indicator-separator{
		display: none !important;
	}

	.react-select__placeholder {
		position: absolute;
		color: var(--gray-500);
	}

	.react-select__clear-indicator{
		transform: rotate(0deg) !important;
		& path {
			fill: var(--gray-600);
			
		}
		&:hover{
			cursor: pointer;
			& path {
				fill: var(--gray-400);	
			}	
		}
	}
`

export const errorStyle = css`
  border: 1px solid var(--error-200);
  box-shadow: 0 0 0 4px var(--error-100), 0 1px 2px 0 #101828;
`

export const inputWrapper = (isDisabled: boolean | undefined,): string => {
	return css`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: ${isDisabled ?
		'var(--gray-50)' :
		'var(--base-white)'}; 
  border: 1px solid ${isDisabled ?
		'var(--gray-100)' :
		'var(--gray-200)'}; 
  border-radius: 8px;
  box-sizing: border-box;
  padding: 0 12px;
  position: relative;
  height: 44px;

  	&:focus-within {
		border: 1px solid var(--primary-200);
		box-shadow: 0 0 0 4px var(--primary-100), 0 1px 2px 0 #101828;

		.react-select__indicator {
			color: inherit;
			transform: rotate(180deg);
			transition: transform 0.3s ease;
		} 

		.react-select__clear-indicator{
			& path {
				fill: var(--primary-600);		
			}
		}
  	}

  &.error {
    border: 1px solid var(--error-200);
    box-shadow: 0 0 0 4px var(--error-100), 0 1px 2px 0 #101828;
  }
`
}

export const leftSvg = (isMenuOpen: boolean, isDisabled?: boolean,): string => {
	let fillColor

	if (isDisabled) {
		fillColor = 'var(--gray-300)'
	} else if (isMenuOpen) {
		fillColor = 'var(--primary-600)'
	} else {
		fillColor = 'currentColor'
	}

	return css`
    & path {
      fill: ${fillColor};
    }
  `
}

export const chevronIcon = (isMenuOpen: boolean, isDisabled?: boolean,): string => {
	let transformValue = 'rotate(0deg)'
	let fillValue = 'currentColor'

	if (isMenuOpen) {
		transformValue = 'rotate(180deg)'
		fillValue = 'var(--primary-600)'
	}

	if (isDisabled) {
		fillValue = 'var(--gray-300)'
	}

	return css`
    & svg {
      transition: transform 0.3s ease, fill 0.3s ease;
      transform: ${transformValue};
      fill: ${fillValue};
    }
    & path {
      transition: transform 0.3s ease, fill 0.3s ease;
      fill: ${fillValue};
    }
  `
}

export const addOptionWrapper = css`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  padding: 11px 66px;

  &:hover{
    cursor: pointer;
  }
`

export const addOptionPlusIcon = css`
  & path {
    fill: var(--primary-600);
  }
`

export const addOptionText = css`
${montserratMidbold}
  font-size: 14px;
  line-height: 19.6px;
  color: var(--primary-600);
`

export const wrapper = css`
  position: relative;
`

export const customMultiSelectItem = css`
   padding: 6px;
   border: 1px solid var(--gray-200);
   border-radius: 8px;
   display: flex;
   align-items: center;
   gap: 6px;
   font-size: 14px;   
   height: 34px;
   max-width: 120px;
   color: var(--gray-900);
   ${montserratMediumReg};

	&:hover {
		cursor: pointer;
	}
`

export const singleValueSpan = css`
	&:hover {
		cursor: pointer;
	}
`

export const customMultiSelectItemBtn = css`
   width: 20px !important;
   height: 20px !important;
   flex-shrink: 0 !important;
   display: block !important;
   max-width: none !important;
   cursor: pointer;
`

export const multiValueText = css`
width: calc(100% - 20px - 6px);
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
`

export const infoBadge = css`
	 padding: 2px 10px;
	 border-radius: 16px;
	  ${montserratMidbold}
	  color: var(--base-white);
	  font-size: 14px;
	  font-style: italic;
	  display: inline-block !important;
`

export const corporateBadge = css`
  background: linear-gradient(180deg, rgba(22, 179, 100, 0.6) 70%, rgba(22, 179, 100, 0) 100%);
  border: 1px solid var(--green-200);
`

export const privateBadge = css`
 background: linear-gradient(180deg, rgba(34, 54, 243, 0.7) 70%, rgba(34, 54, 243, 0) 100%);
  border: 1px solid var(--primary-200);
`

export const jointBadge = css`
 background: linear-gradient(180deg, rgba(254, 97, 35, 0.7) 70%, rgba(224, 79, 22, 0) 100%);
  border: 1px solid var(--orange-200);
`

const dotFlashing = keyframes`
  0%   { content: ""; }
  33%  { content: "."; }
  66%  { content: ".."; }
  100% { content: "..."; }
`

export const loadingTextStyles = css`
  width: fit-content;
  ${montserratMidbold}
  font-size: 14px;
  line-height: 19.6px;
  color: var(--primary-600);
  &::before {
    content: "Loading";
  }
  &::after {
    display: inline-block;
    animation: ${dotFlashing} 1s steps(3, end) infinite;
    content: "...";
    width: 1em;
  }
`

// export const auditLabel = (type: TransactionTypeAuditType | null,): string => {
// 	return css`
//   padding: 2px 8px;
//   border-radius: 16px;
//   color: var(--base-white);
//   ${montserratMidbold}
//   font-size: 12px;
//   font-style: italic;

//   ${type === TransactionTypeAuditType.ADDED ||
//   type === TransactionTypeAuditType.RELATION ||
//   type === TransactionTypeAuditType.RESTORED ?
// 		`
//       background-color: #16B36499;
//       border: 1px solid var(--green-200);
//     ` :
// 		''}

//   ${type === TransactionTypeAuditType.EDITED ?
// 		`
//       background-color: #2236F3B2;
//       border: 1px solid var(--primary-200);
//     ` :
// 		''}

//   ${type === TransactionTypeAuditType.ARCHIVED ||
//   type === TransactionTypeAuditType.DELETED ?
// 		`
//       background-color: #70707BB2;
//       border: 1px solid var(--gray-200);
//     ` :
// 		''}
// `
// }

export const auditFirst = css`
    background-color: #16B36499;
      border: 1px solid var(--green-200);
`

export const auditSecond = css`
      background-color: #2236F3B2;
      border: 1px solid var(--primary-200);
`

export const auditThird = css`
      background-color: #70707BB2;
      border: 1px solid var(--gray-200);
`
