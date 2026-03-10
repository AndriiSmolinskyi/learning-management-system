import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
	spaces,
} from '../../../../../../shared/styles'

export const buttonsBlockWrapper = css`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

export const statusButtonsWrapper = css`
    display: flex;
    gap: ${spaces.tiny};
    align-items: center;
    border-radius: 14px;
    padding: ${spaces.tiny};
    box-shadow: 0px 2px 6px 0px #1827511A inset;
    border: 1px solid var(--primary-200);
`

export const buttonDivider = css`
    height: 28px;
    width: 1px;
    background-color: var(--primary-200);
`

export const actionButtonsWrapper = css`
    display: flex;
    gap: ${spaces.smallMedium};
    align-items: center;
`

export const declineButoon = (isActive: boolean,): string => {
	return css`
    ${montserratMidbold}
    font-size: 14px;
    line-height: 19.6px;
    background: var(--gradients-red-button);
    border-radius: ${spaces.smallMedium};
    padding: ${spaces.smallMedium} ${spaces.mid20};
    border: ${isActive ?
		'1px solid var(--error-200)' :
		'1px solid var(--error-100)'};
    color: ${isActive ?
		'var(--error-600)' :
		'var(--error-200)'};
    box-shadow: 0px 1px 2px 0px #1018280D;
    outline: none !important;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 47px;
`
}

export const approveButton = (isActive: boolean,): string => {
	return css`
     ${montserratMidbold}
    font-size: 14px;
    line-height: 19.6px;
    background: var(--gradients-green-button);
    border-radius: ${spaces.smallMedium};
    padding: ${spaces.smallMedium} ${spaces.mid20};
    border: ${isActive ?
		'1px solid var(--green-200)' :
		'1px solid var(--green-100)'};
    color: ${isActive ?
		'var(--green-600)' :
		'var(--green-200)'};
    box-shadow: 0px 1px 2px 0px #1018280D;
    outline: none !important;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 47px;
`
}

export const quantitySpan = (isGreen: boolean,): string => {
	return css`
    ${montserratMidbold}
    font-size: 12px;
    line-height: 16.8px;
    font-style: italic;
    background: ${isGreen ?
		'var(--gradients-badges-green)' :
		'var(--gradients-badges-red)'};
    border-radius: ${spaces.medium};
    padding: 2px 9.5px 2px 6.5px;
    border: ${isGreen ?
		'1px solid var(--green-200)' :
		'1px solid var(--red-200)'};
    color: var(--base-white);
`
}

export const statusButton = (isActive: boolean,): string => {
	return css`
  ${montserratMidbold}
   font-size: 14px;
   line-height: 19.6px;
   color:  ${isActive ?
		'var(--base-white)' :
		'var(--gray-700)'};
   outline: none !important;
   border: none;
   border-radius:  ${spaces.smallMedium};
   padding: ${spaces.small} ${spaces.medium};
   background: ${isActive ?
		'var(--gradients-blue-button)' :
		'transparent'};
   height: 36px;
   cursor: pointer;
    transition: all 0.3s ease;
   &:not([disabled]):hover{
      background: var(--primary-100);
   }
   &:disabled{
      cursor: not-allowed;
   }
 `
}
