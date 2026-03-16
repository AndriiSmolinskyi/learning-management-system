import {
	css,
} from '@emotion/css'

export const container = css`
	position: relative;
	display: flex;
	gap: 16px;
	width: 100vw;
	min-width: 1280px;
	height: 100vh;
	margin: 0 auto;
	overflow: hidden;
	padding: 16px 0 0 16px;
	background-color: var(--primary-100);
`

export const backdrop = css`
	width: 100vw;
	height: 100vh;
	position: absolute;
	top: 0;
	left: 0;
	background: var(--gradients-transparency-bg10);
	z-index: 3;
`
export const block = css`
	width: calc(100% - 90px);
	height: 100%;
`

export const loaderWrapper = css`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`

export const loader = css`
  width: 200px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 8px solid var(--primary-200);
  border-right-color: var(--primary-600);
  animation: l2 1s infinite linear;

@keyframes l2 {to{transform: rotate(1turn)}}
`