import { FC, MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react"
import styles from './draggingMarker.module.scss'

type PropType = {
    iconUrl: string,
    onMove: (clientX: number, clientY: number) => void,
}

const DraggingMarker: FC<PropType> = ({ iconUrl, onMove }) => {
    const overlay = useRef<HTMLButtonElement>(null)
    const [mousePosition, setMovePosition] = useState({x: 0, y: 0})

    useEffect(() => {
        if (!window) return

        const handler = (e: MouseEvent) => { setMovePosition({ x: e.clientX, y: e.clientY }) }
        window.addEventListener('mousemove', handler)

        return () => window.removeEventListener('mousemove', handler)
    }, [])

    function onClick(e: ReactMouseEvent) {
        e.stopPropagation()
        onMove(e.clientX, e.clientY)
    }

    function getCoords() {
        if (!overlay.current) return

        const hitBox = overlay.current.getBoundingClientRect()
        const x = 100 * (mousePosition.x - hitBox.left) / hitBox.width
        const y = 100 * (mousePosition.y - hitBox.top) / hitBox.height

        return { left: `${x}%`, top: `${y}%`}
    }

    return (
        <button ref={overlay} className={styles.overlay} onClick={onClick}>
            <div style={getCoords()} className={styles.marker}>
                <img src={iconUrl}/>
            </div>
        </button>
    )
}

export default DraggingMarker