import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
	spaces,
	montserratMediumReg,
} from '../../../../../../shared/styles'

export const oldDocBlock = css`
    display: flex;
    gap: 12px;
    flex-wrap: nowrap;
    overflow-x: auto;
	::-webkit-scrollbar {
    	display: none;
  	}
	scrollbar-width: none;
	-webkit-overflow-scrolling: touch;
	-ms-overflow-style: none;
    padding:  0px ${spaces.mid20};
    margin-top: 20px;
`

export const oldDoc = css`
    width: 240px;
    height: 60px;
    border-radius: 14px;
    border: 1px solid var(--gray-100);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--base-white);
    padding: ${spaces.smallMedium};
    box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
    flex-shrink: 0;
`

export const oldDocLeft = css`
    display: flex;
    gap: ${spaces.smallMedium};
    align-items: center;
`

export const oldDocTextBlock = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

export const oldDocTextType = css`
    ${montserratMidbold}
    font-size: 12px;
    color: var(--gray-800);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 130px;
    display: block
`

export const oldDocTextFormat = css`
    ${montserratMediumReg}
    font-size: 12px;
    color: var(--gray-500);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

export const docsIcon = css`
    width: 33px;
    height: 33px;
    flex-shrink: 0 !important;
`