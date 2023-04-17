import { FC } from "react"
import styles from './createMenu.module.scss'

type PropType = {
    onNewMarker: () => void,
    onNewPath: () => void,
    onNewArea: () => void,
}

const CreateMenu: FC<PropType> = ({onNewMarker, onNewPath, onNewArea}) => {
    return (
        <div className={styles.menu}>
            <button onClick={onNewMarker}><img src="/pin.svg" /> Marker </button>
            <button onClick={onNewPath}><img src="/pin.svg" /> Path </button>
            <button onClick={onNewArea}><img src="/pin.svg" /> Area </button>
        </div>
    )
}

export default CreateMenu