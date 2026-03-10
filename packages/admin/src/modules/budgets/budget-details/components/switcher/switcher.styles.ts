import {
	css,
} from '@emotion/css'

export const container = css`
	height: 60px;
	width: 221px;
	box-shadow: -1px 2px 8px 0px #2A2C731A;
	background-color: var(--base-white);
	border-radius: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
`

export const buttonsWrapper = css`
	width: 205px;
	height: 44px;
	background-color: var(--base-white);
	border-radius: 14px;
	border: 1px solid var(--primary-200);
	box-shadow: 0px 2px 6px 0px #1827511A inset;
	display: flex;
	justify-content: space-between;
	padding: 4px;
	align-items: center;
	gap: 9px;
`

export const filterButton = (isSelected: boolean,): string => {
	return css`
	position: relative;
	width: calc((100% - 9px) / 2);
	border: 1px solid transparent;
	&:not(:first-child)::before {
			content: '';
			position: absolute;
			left: -7px;
			top: 2;
			width: 1px;
			height: 28px;
			background-color: var(--primary-200);
		}

		& svg {
			& path {
				fill: currentColor;
			}
		}
	`
}