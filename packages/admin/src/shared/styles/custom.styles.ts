import {
	css,
} from '@emotion/react'

export const customScrollbar = css`
  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--gray-300);
    border-radius: 10px;
    box-shadow: inset -3px 3px 0px 4px var(--base-white);
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
  
   &::-webkit-scrollbar-corner {
    background-color: transparent;
  }
`