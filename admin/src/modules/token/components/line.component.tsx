import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	line,
} from './line.style'

type LineProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string
}

export const Line: React.FC<LineProps> = ({
	className,
},) => {
	return (
		<div className={cx(line, className && className,)}></div>
	)
}

