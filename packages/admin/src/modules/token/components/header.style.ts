import {
	css,
} from '@emotion/css'
import {
	orbitronSemibold, orbitronRegular,
} from '../../../shared/styles'

export const container = css`
	width: 100%;
	height: 66px;
	display: flex;
	justify-content: space-between;
	border-bottom: 2px solid var(--dark-gray);
	flex-shrink: 0;
	background-color: var(--black);

	@media (max-width: 1200px) {
		padding: 0 30px;
	}
`

export const header = css`
	max-width: 1200px;
	width: 100%;
	margin: 0 auto;
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
`

export const title = css`
	text-transform: uppercase;
	${orbitronSemibold(32,)}
	color: var(--green);
`

export const linkBlock = css`
	display: flex;
	gap: 50px;

	@media (max-width: 768px) {
  position: absolute;
  top: 66px;
  left: -100%;
  width: 100%;
  height: calc(100vh - 66px);
  background-color: var(--base-black);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  transition: left 0.3s ease;
  z-index: 10;
}
`

export const linkBlockActive = css`
	@media (max-width: 768px) {
		left: 0;
	}
`

export const links = css`
	text-decoration: none;
	${orbitronRegular(16,)}
	color: var(--white);
	cursor: pointer;

	&:hover {
		color: var(--green);
		svg path {
			fill: var(--green);
		}
	}
`

export const iconBlock = css`
	display: flex;
	align-items: center;
	gap: 24px;

	@media (max-width: 768px) {
		display: none;
	}
`

export const burger = css`
	display: none;
	${orbitronRegular(26,)}
	cursor: pointer;
	user-select: none;
	color: var(--white);
	

	@media (max-width: 768px) {
		display: block;
	}
`
