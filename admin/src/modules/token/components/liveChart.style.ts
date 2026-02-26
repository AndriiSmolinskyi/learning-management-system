import {
	css,
} from '@emotion/css'
import {
	orbitronRegular,
} from '../../../shared/styles'

export const LiveChartWrapper = css`
  	text-align: center;
	padding: 72px 0px;
`
export const container = css`
	max-width: 1200px;
	width: 100%;
	margin: 0 auto;
`
export const title = css`
		margin-bottom: 34px;
		transition: all 0.6s ease; 
		font-weight: 600;
		font-size: 40px;
		&:hover{
		color:var(--white);
		text-shadow: 15px 0px 3px rgba(255, 255, 255, 0.5);
		}
`

export const description = css`
 padding: 24px 0 32px;
  max-width: 630px;
  margin: 0 auto;
  p{
  	${orbitronRegular(24,)}
  }
`
export const view = css`

	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
	height: 146px;
   max-width: 1200px;
   border: 1px solid #111;
	
	&::before {
	z-index: -1;
		content: "";
		position: absolute;
		inset: 0;
		background: radial-gradient(circle, rgba(0,255,100,0.25) 70%, transparent 100%);
		opacity: 0;
		transition: opacity 0.5s ease;
	}
	
	&:hover::before {
		opacity: 0.4;
	}
`

export const linesStyle = css`
	margin-top: 30px;
`