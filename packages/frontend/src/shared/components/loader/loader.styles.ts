import {
	css,
} from '@emotion/css'
import type {
	Property,
} from 'csstype'

export const loaderWrapper = css`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`

export const loader = ({
	width,
	radius,
	position,
}: {
		width: number,
		radius: number,
		position: Property.Position
},): string => {
	return css`
		width: ${width}px;
		aspect-ratio: 1;
		border-radius: 50%;
		border: ${radius}px solid var(--primary-200);
		border-right-color: var(--primary-600);
		animation: l2 1s infinite linear;

@keyframes l2 {to{transform: rotate(1turn)}}
`
}