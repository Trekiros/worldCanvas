import { FC, MouseEvent, ReactNode, useState } from "react"
import styles from './clickableImg.module.scss'

type PropType = {
    src: string,                                    // Image url
    onClick?: (x: number, y: number) => void,       // x and y are expressed in % offsets from the image's top left corner
    children?: ReactNode,                           // These can be absolutely position with relation to the image itself
}

const ClickableImg: FC<PropType> = ({src, onClick, children}) => {
    // Using this instead of onClick to avoid catching pan moves accidentally
    // TODO: fallback for mobile
    const [clicking, setClicking] = useState(false)

    function onMouseDown() { setClicking(true) }
    function onMouseMove() { setClicking(false) }
    function onMouseUp(e: MouseEvent) {
        if (!clicking) return
        setClicking(false)

        if (!onClick) return
        onClick(e.clientX, e.clientY)
    }

    return (
        <div className={styles.clickableImg}>
            <button
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                className={styles.imageBtn}
            >
                <img src={src} className={styles.image} id='mapImage' />
            </button>
            <div className={styles.overlay}>
                <div onMouseDown={(e) => e.stopPropagation()}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default ClickableImg