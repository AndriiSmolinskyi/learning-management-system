import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
} from './../../../../../../../../shared/styles'

export const buttonWrapper = (isActive: boolean,):string => {
	return css`
    width: 125px;
    height: 40px;
    border-radius: 12px;
    outline: none! important;
    border: ${isActive ?
		'1px solid var(--primary-200)' :
		'1px solid var(--gray-200)'};
    background: ${isActive ?
		'var(--gradients-download-button)' :
		'var(--gradients-back-link-gray)'};
    box-shadow: 0px 1px 2px 0px #1018280D;
    padding: 8px;
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 10px;
    position: relative;

    ${montserratMidbold}
    font-size: 14px;
    line-height: 19.6px;
    color: ${isActive ?
		'var(--primary-600)' :
		'var(--gray-400)'};

    &:not(:last-child)::after {
        content: '';
        position: absolute;
        width: 2px;
        height: 32px;
        bottom: -32px;
        left: 62.5px;
        background-color: var(--gray-200);
    }
`
}

export const activeStepIcon = css`
	 box-shadow: 0px 0px 0px 4px var(--primary-100);
	   width: 24px;
  height: 24px;
  background: var(--base-white);
  border-radius: 50%;
  border: 1px solid var(--primary-200);
  display: flex;
  justify-content: center;
  align-items: center;
`