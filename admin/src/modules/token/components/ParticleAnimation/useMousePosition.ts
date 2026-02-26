import {
	useState, useEffect,
} from 'react'

interface IMousePosition {
  x: number;
  y: number;
}

export default function useMousePosition(): IMousePosition {
	const [mousePosition, setMousePosition,] = useState<IMousePosition>({
		x: 0, y: 0,
	},)
	useEffect(() => {
		const handleMouseMove = (event: MouseEvent,):void => {
			setMousePosition({
				x: event.clientX, y: event.clientY,
			},)
		}

		window.addEventListener('mousemove', handleMouseMove,)

		return () => {
			window.removeEventListener('mousemove', handleMouseMove,)
		}
	}, [],)

	return mousePosition
}