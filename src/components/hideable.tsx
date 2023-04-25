import { FC, ReactNode, useEffect, useState } from "react";
import styles from './hideable.module.scss'

type PropType = {
    visible: boolean,
    children?: ReactNode,
}

const Hideable:FC<PropType> = ({ visible, children }) => {
    const [hidden, setHidden] = useState(visible)

    // Unmount if hidden, to save memory
    useEffect(() => {
        if (visible) {
            setHidden(false)
        }

        if (!visible) {
            setTimeout(() => {
                setHidden(true)
            }, 200)
        }
    }, [visible])

    if (hidden) return <></>

    return (
        <div className={`${styles.hideable} ${visible ? styles.visible : styles.hidden}`}>
            {children}
        </div>
    )
}

export default Hideable