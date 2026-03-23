import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
	montserratSemibold,
	montserratMediumReg,
} from '../../../shared/styles'

export const emptyContainer = css`
    height: calc(100% - 84px - 44px);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 16px;
	 position: absolute;
	 right: 40%;
`

export const emptyText = css`
    ${montserratMidbold}
    font-size: 12px;
    color: var(--gray-600);
    font-style: italic;
`

export const listBlock = css`
	display: flex;
	gap: 20px;
	padding: 20px;
`

export const liItemWrapper = css`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	position: relative;
	width: calc((100% - 48px) / 4);
	height: 225px;
	border-radius: 22px;
	padding: 16px;
	background: var(--base-white);
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	cursor: pointer;

	/* &:hover{
		background-color: var(--gray-25);
	} */

`

export const courseName = css`
	${montserratSemibold}
		font-size: 24px;
		color: var(--gray-700);
		width: 240px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
`

export const groupName = css`
	${montserratMediumReg}
	font-size: 16px;
	color: var(--gray-600);
	margin-top: 4px;
`

export const starDate = css`
	${montserratMediumReg}
	font-size: 14px;
	color: var(--gray-600);
	margin-top: 4px;
`

export const headerWrapper = css`
	width: 100%;
	height: 82px;
	background-color: var(--base-white);
	/* border-top-left-radius: 26px; */
	border-radius: 26px;
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px;
`

export const titleIconBlock = css`
	display: flex;
	align-items: center;
	gap: 8px;
	
`

export const headerTitle = css`
	${montserratSemibold}
	font-size: 26px;
	line-height: 36.4px;
	color: var(--gray-800);
`

export const wrapper = css`
	padding-right: 16px;
	height: 100%;
`

export const main = css`
	background-color: var(--base-white);
	width: 100%;
	height: 100%;
	margin-top: 20px;
	border-radius: 26px;
	box-shadow: -2px 4px 10px 0px #2A2C731F;
	display: flex;
`

export const side = css`
	border-top-left-radius: 26px;
	width: 15%;
	height: 100%;
	border-right: 1px solid var(--gray-100);
`

export const lessonName = css`
	${montserratSemibold}
		font-size: 16px;
		color: var(--gray-700);
		width: 240px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
`

export const lessonItemList = (isActive: boolean,): string => {
	return css`
		padding: 20px;
		border-bottom: 1px solid var(--gray-100);
		cursor: pointer;
		color: ${isActive ?
		'var(--blue-500)' :
		'var(--gray-800)'};
		background: ${isActive ?
		'var(--blue-50)' :
		'transparent'};

		p {
			color: ${isActive ?
		'var(--blue-500)' :
		'var(--gray-800)'};
		}
	`
}