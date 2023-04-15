import { FC } from "react"
import { KeepScale } from "react-zoom-pan-pinch";
import { Point } from "@/model/map"
import styles from './pinCreator.module.scss'

type PropType = {
    x: number,
    y: number,
    onPinCreated: (newPin: Point) => void,
}

const PinCreator: FC<PropType> = ({x, y}) => {
    return (
        <div className={styles.pinCreatorContainer} style={{left: `${x}%`, top: `${y}%`}}>
            <KeepScale>
                <div className={styles.pinCreator}>
                    Hello World
                </div>
            </KeepScale>
        </div>
    )
}

export default PinCreator