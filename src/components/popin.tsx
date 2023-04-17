import { FC, ReactNode } from "react";
import { KeepScale } from "react-zoom-pan-pinch";

import styles from './popin.module.scss'

type PropType = {
    children: ReactNode,
    x: number,
    y: number,
}

const Popin: FC<PropType> = ({children, x, y}) => {
    return (   
        <div className={styles.popinContainer} style={{left: `${x}%`, top: `${y}%`}}>
            <KeepScale>
                <div className={styles.popin}>
                    {children}
                </div>
            </KeepScale>
        </div>
    )
}

export default Popin