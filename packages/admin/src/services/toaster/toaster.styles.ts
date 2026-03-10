import {
	css,
} from '@emotion/css'
import {
	Classes,
} from '@blueprintjs/core'

export const container = css`
	z-index: 10001 !important;
	.${Classes.TOAST} {
		background-color: var(--gray-100) !important;
		border: 1px solid var(--gray-200);
		box-shadow: none;
		display: flex;
		width: 356px;
		justify-content: space-between;
		& .${Classes.TOAST_MESSAGE} {
			color: var(--error-600);
			padding: 0px;
		}
		& .${Classes.BUTTON_GROUP} {
			padding: 0 !important;
			& .${Classes.BUTTON} {
				width: 24px;
				height: 24px;
				padding: 0 !important;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: transparent !important;
				&:hover,
				&:focus {
					background-color: transparent !important;
				}
				color: var(--gray-600) !important;
				& path,
				& svg {
					fill: var(--gray-600) !important;
				}
			};
		};
	}
`