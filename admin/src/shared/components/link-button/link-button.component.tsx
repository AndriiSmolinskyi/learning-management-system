import React from 'react'
import {
	linkStyle,
} from './link.style'

type Props = {
  href?: string
	text: string
	id?: string
	target?: string;
	rel?: string;

}

export const LinkButton: React.FC<Props> = ({
	href, text, target,rel,
},) => {
	return (
		<a
			href={href}
			target={target}
			rel={rel}
			className={linkStyle}
		>
			{text}
		</a>
	)
}