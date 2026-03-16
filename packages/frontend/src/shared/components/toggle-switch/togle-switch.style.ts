import {
	css,
} from '@emotion/css'

export const switchWrapper = css`
  .bp5-control-indicator{
    width: 51px !important;
    height: 31px !important;
    border-radius: 100px !important;

    &::before{
      width: 27px !important;
      height: 27px !important;
      box-shadow: none !important;
    }
  }

  .bp5-switch input:focus + .bp5-control-indicator {
    outline: none;
    box-shadow: none;
  }

  .bp5-switch:focus-within .bp5-control-indicator {
    outline: none;
    box-shadow: none;
  }

  .bp5-control.bp5-switch input:checked ~ .bp5-control-indicator::before {
    left: calc(100% - 2em);
  } 
`