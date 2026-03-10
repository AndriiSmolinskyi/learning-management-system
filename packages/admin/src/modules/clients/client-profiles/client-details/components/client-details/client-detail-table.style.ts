import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratMidbold,
} from '../../../../../../shared/styles'

export const Table = css`
    background-color: var(--base-white);
    margin-top: ${spaces.mid20};
    border-radius: 22px;
`
export const TableHedaer = css`
    padding: ${spaces.mid20};
    display: flex;
    align-items: center;
    justify-content: space-between;
`

export const TableHeaderBtnBlock = css`
    height: 44px;
    width: 432px;
    padding: 3px;
    border: 1px solid var(--primary-200);
    background-color: var(--base-white);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0px 2px 6px 0px #1827511A inset;
`

export const TableHeaderBtnBlockLine = css`
    width: 1px;
    height: 28px;
    background-color: var(--primary-200);
`

export const TableHeaderBtn = css`
    padding: ${spaces.small} ${spaces.medium};
    cursor: pointer;
    ${montserratMidbold}
    font-size: 14px;
    color: var(--gray-700); 
	 &:hover{
      background: var(--primary-100);
		border-radius: 12px;
   }
`

export const TableHeaderBtnSelected = css`
    padding: ${spaces.small} ${spaces.medium};
    cursor: pointer;
    ${montserratMidbold}
    font-size: 14px;
    color: var(--base-white) !important; 
    background: var(--gradients-button-primary-blue) !important;
    border-radius: 12px;
`

export const tableBlock = css`
	max-height: 324px;
`

export const navigateButton = css`
	width: 100%;
`

export const tableFooter = css`
	padding: 20px;
`