import { FC, ReactNode } from "react";

import styles from './popin.module.scss'

type PropType = {
    children: ReactNode,
    x: number,
    y: number,
    yOffset?: boolean,
}

const Popin: FC<PropType> = ({children, x, y, yOffset}) => {
    return (
        <div className={styles.popinContainer} style={{left: `${x}%`, top: `${y}%`}}>
            <div className={`${styles.popin} ${yOffset ? styles.yOffset : ''}`}>
                {children}
            </div>
        </div>
    )
}

export default Popin