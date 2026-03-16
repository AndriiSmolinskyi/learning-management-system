import {
	css,
} from '@emotion/css'

import sunIcon from '../../../assets/icons/sun.svg'
import autoIcon from '../../../assets/icons/dot-in-a-circle.svg'
import moonIcon from '../../../assets/icons/moon.svg'
import statusIcon from '../../../assets/icons/status.svg'

export const container = css`
  max-width: 96px;
  justify-self: flex-end;
`

export const switcher = css`
  display: grid;
  grid-template-columns: repeat(3, 32px);
  padding: 2px;
  border: none;
  position: relative;
  border-radius: 18px;
`

export const radio = css`
  appearance: none;
  margin: 0;
  width: 32px;
  height: 32px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 24px;
  transition: all 0.1s ease-in;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &:focus-visible ~ div {
    box-shadow: 0 0 0 2px black;
  }

  filter: invert(0);
	  
  &:checked {
    filter: invert(1);
	z-index: 1;
  }
`

export const status = css`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-repeat: no-repeat;
  background-image: url(${statusIcon});
  background-size: 32px;
  background-position: center;
  transition: all 0.1s ease-in;
  pointer-events: none;
`

export const radioLight = css`
  background-image: url(${sunIcon});

  &:checked ~ div {
    background-position: left 2px center;
  }
`

export const radioAuto = css`
  background-image: url(${autoIcon});

  &:checked ~ div {
    background-position: center center;
  }
`

export const radioDark = css`
  background-image: url(${moonIcon});

  &:checked ~ div {
    background-position: right 2px center;
  }
`
