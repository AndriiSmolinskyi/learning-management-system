import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
	spaces,
} from '../../../../../../shared/styles'

export const modalWrapper = css`
	width: 400px !important;
	height: 169px !important;
	background-color: var(--base-white) !important;
	border-radius: ${spaces.medium} !important;
	padding: ${spaces.medium} !important;
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const successText = css`
	${montserratSemibold}
	font-size: 18px;
	line-height: 25.2px;
	color: var(--gray-800);
	margin-top:  ${spaces.smallMedium};
`

export const closeIcon = css`  
    position: absolute;
    top: 20px;
    right: 20px;
    &:hover {
        cursor: pointer;
    }
`

export const button = css`
    background: linear-gradient(180deg, #F6F6F6 0%, #FFFFFF 9%, #F4F4F4 100%);
    border: 1px solid var(--gray-200);
    box-shadow: 0px 1px 2px 0px #1018280D;
    color: var(--gray-800);
	margin-top:  ${spaces.medium};
	width: 100%;
`