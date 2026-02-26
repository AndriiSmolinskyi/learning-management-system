import {
	css,
} from '@emotion/css'

export const body = css`
  	height: calc(100vh - 66px);   
	overflow-x: hidden;
	scroll-behavior: smooth;
	position: relative;  
	flex: 1 1 auto;
	overflow-y: auto;;
  	&::-webkit-scrollbar {
		width: 7px;
		height: 7px;
	}

  	&::-webkit-scrollbar-thumb {
		border-radius: 10px;
    background-color: var(--gray);

	}

	&::-webkit-scrollbar-track {
		background-color: transparent;
		margin-top: 38px;
	}
  
   &::-webkit-scrollbar-corner {
		background-color: transparent;
	}
`

export const particles = css`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  height: 100dvh; 
  width: 100vw;

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
`
