import { FC, MouseEvent, ReactNode, useRef, useState } from "react"
import styles from './clickableImg.module.scss'

type PropType = {
    src: string,                                    // Image url
    onClick?: (x: number, y: number) => void,       // x and y are expressed in % offsets from the image's top left corner
    children?: ReactNode,                           // These can be absolutely position with relation to the image itself
}

const ClickableImg: FC<PropType> = ({src, onClick, children}) => {
    const btnRef = useRef<HTMLButtonElement>(null)

    // Using this instead of onClick to avoid catching pan moves accidentally
    // TODO: fallback for mobile
    const [clicking, setClicking] = useState(false)

    function onMouseDown() { setClicking(true) }
    function onMouseMove() { setClicking(false) }
    function onMouseUp(e: MouseEvent) {
        if (!clicking) return
        
        setClicking(false)

        if (!onClick || !btnRef.current) return

        // Calculate x and y as percentages
        const hitBox = btnRef.current.getBoundingClientRect()
        const x = 100 * (e.clientX - hitBox.left) / hitBox.width
        const y = 100 * (e.clientY - hitBox.top) / hitBox.height

        onClick(x, y)        
    }


    return (
        <button
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            ref={btnRef}
            className={styles.clickableImg}
        >
            <img src={src} className={styles.image} />
            <div className={styles.overlay}>
                {children}
            </div>
        </button>
    )
}

export default ClickableImg