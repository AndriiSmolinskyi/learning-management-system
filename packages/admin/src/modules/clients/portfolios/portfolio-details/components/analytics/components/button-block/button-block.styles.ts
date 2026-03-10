import {
	css,
} from '@emotion/css'

export const buttonsWrapper = css`
	width: calc(100% - 40px);
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
	width: calc((100% - 25px) / 3);
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