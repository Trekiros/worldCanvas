import { FC } from "react"
import { faLocationDot, faArrowTrendUp, faDrawPolygon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './createMenu.module.scss'

type PropType = {
    onNewMarker: () => void,
    onNewPath: () => void,
    onNewArea: () => void,
}

const CreateMenu: FC<PropType> = ({onNewMarker, onNewPath, onNewArea}) => {
    return (
        <div className={styles.menu}>
            <button onClick={onNewMarker}><FontAwesomeIcon icon={faLocationDot} /> Marker </button>
            <button onClick={onNewPath}><FontAwesomeIcon icon={faArrowTrendUp} /> Path </button>
            <button onClick={onNewArea}><FontAwesomeIcon icon={faDrawPolygon} /> Area </button>
        </div>
    )
}

export default CreateMenu