import {
	css, keyframes,
} from '@emotion/css'
import {
	orbitronMax, orbitronSemibold,
} from '../../../shared/styles'
export const pulse = keyframes`
  0% { opacity: 0.7; }
  50% { opacity: 0.5; }
  100% { opacity: 0.7; }
`
export const bounce = keyframes`
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(20px); opacity: 0.8; }
`
export const main = css`
	padding-top: 144px;
	padding-bottom: 72px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
`
export const container = css`
  margin: 0 auto;
  max-width: 750px;
  padding: 0 20px;
  text-align: center;
`
export const mainTitle = css`
 position: relative;
  text-align: center;
`

export const title = css`
  
  ${orbitronMax(48,)}
  color: var(--green);
  
  &::before {
    content: "";
    position: absolute;
    inset: -100px;
    background: var(--radialGradient);
    filter: blur(60px);
    opacity: 0.3;
    animation: ${pulse} 2s linear infinite;
    border-radius: 50%;
	 pointer-events: none; 
  }
`

export const info = css`
	color: var(--white);
	${orbitronSemibold(35,)}
  display: block;
  margin-bottom: 10px;
`

export const description = css`
 max-width: 630px;
	font-size: 24px;
  margin-bottom: 20px;
  line-height: 1.4;
`

export const buy = css`
	margin-top: 15px;
	display: flex;
	justify-content: center;
`
export const arrow = css`
  position: relative;
  margin-top: 200px;
  display: flex;
  justify-content: center;
  animation: ${bounce} 1s infinite ease-in-out;
`