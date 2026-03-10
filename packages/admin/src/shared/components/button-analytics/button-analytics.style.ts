import {
	css,
} from '@emotion/css'

export const containerButtons = css`
	position: absolute;
	right: -8px;
	top: -8px;
	z-index: 1000;
`

export const loaderWrapper = css`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`

export const loader = css`
  width: 30px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 8px solid var(--primary-200);
  border-right-color: var(--primary-600);
  animation: l2 1s infinite linear;

@keyframes l2 {to{transform: rotate(1turn)}}
`